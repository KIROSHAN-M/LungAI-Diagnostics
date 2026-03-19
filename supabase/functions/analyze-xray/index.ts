import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert radiologist AI assistant specialized in chest X-ray analysis. You analyze chest X-ray images to detect the following conditions:

1. **Pneumonia** - Look for consolidation, air bronchograms, ground-glass opacities, pleural effusions
2. **Tuberculosis (TB)** - Look for upper lobe cavitations, hilar lymphadenopathy, miliary pattern, Ghon complex
3. **COVID-19** - Look for bilateral ground-glass opacities, peripheral distribution, crazy paving pattern
4. **Asthma** - Look for hyperinflation, flattened diaphragm, increased AP diameter, peribronchial thickening
5. **Lung Cancer** - Look for masses/nodules, hilar enlargement, mediastinal widening, pleural effusion, bone destruction

For each condition, provide:
- A confidence percentage (0-100%)
- Key findings that support or rule out the diagnosis
- Overall severity assessment

IMPORTANT: You must respond ONLY with valid JSON in this exact format:
{
  "conditions": [
    {
      "name": "Pneumonia",
      "confidence": 85,
      "severity": "Moderate",
      "findings": ["Consolidation in right lower lobe", "Air bronchograms present"]
    },
    {
      "name": "Tuberculosis",
      "confidence": 10,
      "severity": "None",
      "findings": ["No cavitary lesions", "No hilar lymphadenopathy"]
    },
    {
      "name": "COVID-19",
      "confidence": 15,
      "severity": "None",
      "findings": ["No bilateral ground-glass opacities"]
    },
    {
      "name": "Asthma",
      "confidence": 5,
      "severity": "None",
      "findings": ["No hyperinflation signs"]
    },
    {
      "name": "Lung Cancer",
      "confidence": 8,
      "severity": "None",
      "findings": ["No suspicious masses or nodules"]
    }
  ],
  "overallAssessment": "Brief overall assessment here",
  "recommendation": "Brief recommendation here"
}

Be thorough, precise, and clinically accurate. Always include all 5 conditions in your response.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this chest X-ray image carefully. Evaluate for Pneumonia, Tuberculosis, COVID-19, Asthma, and Lung Cancer. Return ONLY valid JSON.",
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from the response
    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse analysis results" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-xray error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
