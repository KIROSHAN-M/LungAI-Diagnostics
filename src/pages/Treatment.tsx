import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, Apple, Moon, Stethoscope, Heart, AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AnalysisData } from "@/components/AnalysisResults";

interface TreatmentPlan {
  medications: { name: string; instruction: string; frequency: string; duration: string }[];
  diet: string[];
  sleepRest: string[];
  doctorRecommendations: string[];
  lifestyleTips: string[];
}

const Treatment = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<AnalysisData | null>(null);
  const [plan, setPlan] = useState<TreatmentPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResults");
    if (!stored) {
      toast.error("Please complete the X-ray analysis first");
      navigate("/scan");
      return;
    }
    const data: AnalysisData = JSON.parse(stored);
    setResults(data);
    fetchTreatment(data);
  }, [navigate]);

  const fetchTreatment = async (data: AnalysisData) => {
    try {
      const patientData = JSON.parse(sessionStorage.getItem("patientData") || "{}");
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-xray`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ mode: "treatment", analysisResults: data, patientData }),
        }
      );
      if (!response.ok) throw new Error("Failed to get treatment plan");
      const result = await response.json();
      setPlan(result);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate treatment plan");
      // Fallback plan
      setPlan({
        medications: [
          { name: "Consult your physician", instruction: "Based on the diagnosis", frequency: "As prescribed", duration: "As directed" },
        ],
        diet: [
          "Warm soups and broths — provides hydration and reduces inflammation",
          "Citrus fruits (oranges, lemons) — rich in Vitamin C",
          "Leafy green vegetables — spinach, kale for iron and antioxidants",
          "Ginger and turmeric tea — natural anti-inflammatory",
        ],
        sleepRest: [
          "Get 8-10 hours of sleep during recovery",
          "Elevate your head 30-45° using extra pillows",
          "Maintain room humidity between 40-60%",
        ],
        doctorRecommendations: [
          "Schedule a follow-up chest X-ray in 48-72 hours",
          "Visit a pulmonologist within 5-7 days",
          "Get Complete Blood Count (CBC) tests immediately",
        ],
        lifestyleTips: [
          "Practice deep breathing exercises",
          "Stay hydrated — drink at least 3 liters daily",
          "Avoid smoking, dust, and polluted environments",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const topCondition = results?.conditions
    ?.filter((c) => c.severity.toLowerCase() !== "none" && c.severity.toLowerCase() !== "normal")
    .sort((a, b) => b.confidence - a.confidence)[0];

  const startNew = () => {
    sessionStorage.removeItem("patientData");
    sessionStorage.removeItem("analysisResults");
    navigate("/patient-info");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Generating treatment plan...</p>
        </div>
      </div>
    );
  }

  const Section = ({ icon: Icon, iconColor, title, children }: { icon: any; iconColor: string; title: string; children: React.ReactNode }) => (
    <div className="card-elevated rounded-xl border border-border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Step 3 of 3</p>
          <h1 className="text-2xl font-bold text-foreground">Treatment & Care Plan</h1>
          {topCondition && (
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {topCondition.name}
              </span>
              <span className="text-xs text-muted-foreground">
                · {topCondition.severity} · {topCondition.confidence}% affected
              </span>
            </div>
          )}
          {!topCondition && (
            <p className="text-sm text-success font-medium mt-2">✅ No significant conditions detected — lungs appear normal</p>
          )}
        </div>

        {/* Medications */}
        {plan && (
          <>
            <Section icon={Pill} iconColor="bg-accent" title="Recommended Medications">
              <div className="space-y-3">
                {plan.medications.map((med, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.instruction}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-accent">{med.frequency}</p>
                      <p className="text-xs text-muted-foreground">{med.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={Apple} iconColor="bg-success" title="Diet & Nutrition">
              <div className="grid sm:grid-cols-2 gap-3">
                {plan.diet.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={Moon} iconColor="bg-info" title="Sleep & Rest Guidelines">
              <div className="space-y-2">
                {plan.sleepRest.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-background border border-border text-sm">
                    <span className="text-info font-semibold">{i + 1}.</span>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={Stethoscope} iconColor="bg-warning" title="Doctor's Recommendations">
              <div className="space-y-2">
                {plan.doctorRecommendations.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-background border border-border text-sm">
                    <span className="text-warning font-semibold">{i + 1}</span>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={Heart} iconColor="bg-destructive" title="Lifestyle Tips">
              <div className="grid sm:grid-cols-2 gap-3">
                {plan.lifestyleTips.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Heart className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        <Button onClick={startNew} className="w-full h-12 text-base font-semibold" style={{ backgroundImage: "var(--gradient-primary)" }}>
          <RotateCcw className="w-5 h-5 mr-2" /> Start New Patient Scan
        </Button>
      </div>
    </div>
  );
};

export default Treatment;
