import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Activity } from "lucide-react";
import { toast } from "sonner";
import XrayUpload from "@/components/XrayUpload";
import AnalysisResults, { AnalysisData } from "@/components/AnalysisResults";
import SampleXrays from "@/components/SampleXrays";
import { Button } from "@/components/ui/button";

const Scan = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisData | null>(null);
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("patientData");
    if (!stored) {
      toast.error("Please fill in patient information first");
      navigate("/patient-info");
      return;
    }
    setPatientData(JSON.parse(stored));
  }, [navigate]);

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    setResults(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-xray`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64: base64, patientData }),
        }
      );
      if (response.status === 429) { toast.error("Rate limit exceeded. Try again later."); return; }
      if (response.status === 402) { toast.error("Payment required. Please add credits."); return; }
      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
      // Store results for treatment page
      sessionStorage.setItem("analysisResults", JSON.stringify(data));
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze X-ray. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">LungAI Diagnostics</h1>
            <p className="text-xs text-muted-foreground">Step 2 of 3 — Lung Analysis</p>
          </div>
          <div className="ml-auto">
            <div className="text-right">
              <span className="text-primary font-bold text-sm">50%</span>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
        </div>
        <div className="w-full h-1 bg-muted">
          <div className="h-full w-[66%]" style={{ backgroundImage: "var(--gradient-primary)" }} />
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {patientData && (
          <div className="mb-6 p-3 rounded-lg bg-card border border-border text-sm text-muted-foreground">
            Patient: <span className="font-semibold text-foreground">{patientData.fullName}</span> · Age {patientData.age} · {patientData.gender} · {patientData.currentProblem}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["Pneumonia", "Tuberculosis", "COVID-19", "Asthma", "Lung Cancer"].map((d) => (
            <span key={d} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              {d}
            </span>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <XrayUpload onImageSelect={analyzeImage} isAnalyzing={isAnalyzing} />
            <SampleXrays onSelect={analyzeImage} isAnalyzing={isAnalyzing} />
          </div>

          <div className="lg:col-span-3">
            {results ? (
              <div className="space-y-4">
                <AnalysisResults data={results} />
                <Button
                  onClick={() => navigate("/treatment")}
                  className="w-full h-12 text-base font-semibold"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                >
                  View Treatment & Care Plan →
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-border card-elevated p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Activity className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isAnalyzing ? "Analyzing X-ray..." : "Upload an X-ray to begin"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {isAnalyzing
                    ? "Our AI is examining the image for signs of lung diseases."
                    : "Upload your chest X-ray or use a sample image to test."}
                </p>
                {isAnalyzing && (
                  <div className="mt-6 w-48 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-1/3 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Scan;
