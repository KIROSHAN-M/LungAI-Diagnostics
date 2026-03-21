import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Activity } from "lucide-react";
import { toast } from "sonner";
import XrayUpload from "@/components/XrayUpload";
import AnalysisResults, { AnalysisData } from "@/components/AnalysisResults";
import SampleXrays from "@/components/SampleXrays";
import ScanningAnimation from "@/components/ScanningAnimation";
import PageOverlayAnimation from "@/components/PageOverlayAnimation";
import { Button } from "@/components/ui/button";
import { playClick, playSuccess, playError, playNavigate, playScan } from "@/hooks/useSoundEffects";
import bgScan from "@/assets/bg-scan.jpg";

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
    playScan();
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
      if (response.status === 429) { playError(); toast.error("Rate limit exceeded. Try again later."); return; }
      if (response.status === 402) { playError(); toast.error("Payment required. Please add credits."); return; }
      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
      sessionStorage.setItem("analysisResults", JSON.stringify(data));
      playSuccess();
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      playError();
      toast.error("Failed to analyze X-ray. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={bgScan} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
      </div>
      <PageOverlayAnimation page="scan" />
      <div className="relative z-10">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 animate-pulse-glow">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">LungAI Diagnostics</h1>
              <p className="text-xs text-muted-foreground">Step 2 of 3 — Lung Analysis</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-primary font-bold text-sm">66%</span>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
          <div className="w-full h-1 bg-muted">
            <div className="h-full w-[66%]" style={{ backgroundImage: "var(--gradient-primary)" }} />
          </div>
        </header>

        <main className="container max-w-6xl mx-auto px-4 py-8">
          {patientData && (
            <div className="mb-6 p-4 rounded-2xl bg-card border border-border card-elevated text-sm text-muted-foreground animate-fade-up">
              Patient: <span className="font-bold text-foreground">{patientData.fullName}</span> · Age {patientData.age} · {patientData.gender} · {patientData.currentProblem}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            {["Pneumonia", "Tuberculosis", "COVID-19", "Asthma", "Lung Cancer"].map((d) => (
              <span key={d} className="px-3 py-1.5 rounded-full bg-card border border-border text-foreground text-xs font-semibold shadow-sm">
                {d}
              </span>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6 animate-slide-left">
              <XrayUpload onImageSelect={analyzeImage} isAnalyzing={isAnalyzing} />
              <SampleXrays onSelect={analyzeImage} isAnalyzing={isAnalyzing} />
            </div>

            <div className="lg:col-span-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {results ? (
                <div className="space-y-4">
                  <AnalysisResults data={results} />
                  <Button
                    onClick={() => { playClick(); playNavigate(); navigate("/treatment"); }}
                    className="w-full h-12 text-base font-bold rounded-xl transition-transform hover:scale-[1.02] active:scale-95"
                    style={{ backgroundImage: "var(--gradient-primary)" }}
                  >
                    View Treatment & Care Plan →
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl border border-border card-elevated p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  {isAnalyzing ? (
                    <ScanningAnimation active={true} />
                  ) : (
                    <>
                      <div className="p-5 rounded-2xl bg-muted mb-5 animate-float">
                        <Activity className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Upload an X-ray to begin</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Upload your chest X-ray or use a sample image to start the diagnosis.
                      </p>
                    </>
                  )}
                  {isAnalyzing && (
                    <h3 className="text-lg font-bold text-foreground mb-2">Analyzing X-ray...</h3>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Scan;
