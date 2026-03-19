import { useState } from "react";
import { Stethoscope, Activity } from "lucide-react";
import { toast } from "sonner";
import XrayUpload from "@/components/XrayUpload";
import AnalysisResults, { AnalysisData } from "@/components/AnalysisResults";
import SampleXrays from "@/components/SampleXrays";

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const analyzeImage = async (base64: string) => {
    setSelectedImage(base64);
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
          body: JSON.stringify({ imageBase64: base64 }),
        }
      );

      if (response.status === 429) {
        toast.error("Rate limit exceeded. Please try again later.");
        return;
      }
      if (response.status === 402) {
        toast.error("Payment required. Please add credits.");
        return;
      }
      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">LungScan AI</h1>
            <p className="text-xs text-muted-foreground">Chest X-ray Disease Detection</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="w-4 h-4 text-primary" />
            <span>AI-Powered Analysis</span>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">
            <span className="text-gradient">Detect Lung Diseases</span>
            <span className="text-foreground"> from X-rays</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a chest X-ray to detect Pneumonia, Tuberculosis, COVID-19, Asthma, and Lung Cancer using advanced AI vision analysis.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Pneumonia", "Tuberculosis", "COVID-19", "Asthma", "Lung Cancer"].map((d) => (
              <span key={d} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Upload + Samples */}
          <div className="lg:col-span-2 space-y-6">
            <XrayUpload onImageSelect={analyzeImage} isAnalyzing={isAnalyzing} />
            <SampleXrays onSelect={analyzeImage} isAnalyzing={isAnalyzing} />
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-3">
            {results ? (
              <AnalysisResults data={results} />
            ) : (
              <div className="rounded-lg border border-border card-elevated p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Activity className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isAnalyzing ? "Analyzing X-ray..." : "Upload an X-ray to begin"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {isAnalyzing
                    ? "Our AI is examining the image for signs of lung diseases. This may take a moment."
                    : "Upload your chest X-ray image or use one of the sample images on the left to test the analysis."}
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

export default Index;
