import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, Apple, Moon, Stethoscope, Heart, AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AnalysisData } from "@/components/AnalysisResults";
import bgTreatment from "@/assets/bg-treatment.jpg";

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
      setPlan({
        medications: [{ name: "Consult your physician", instruction: "Based on diagnosis", frequency: "As prescribed", duration: "As directed" }],
        diet: ["Warm soups and broths", "Citrus fruits rich in Vitamin C", "Leafy green vegetables", "Ginger and turmeric tea"],
        sleepRest: ["Get 8-10 hours of sleep", "Elevate head 30-45°", "Keep room humidity 40-60%"],
        doctorRecommendations: ["Follow-up X-ray in 48-72 hours", "Visit a pulmonologist within 5-7 days", "Get CBC tests immediately"],
        lifestyleTips: ["Practice deep breathing exercises", "Stay hydrated — 3 liters daily", "Avoid smoking and polluted environments"],
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
      <div className="min-h-screen bg-hospital bg-grid flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Generating treatment plan...</p>
        </div>
      </div>
    );
  }

  const Section = ({ icon: Icon, iconColor, title, children }: { icon: any; iconColor: string; title: string; children: React.ReactNode }) => (
    <div className="card-elevated rounded-2xl border border-border p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${iconColor}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <img src={bgTreatment} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      </div>
      <div className="relative z-10">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">LungAI Diagnostics</h1>
            <p className="text-xs text-muted-foreground">Step 3 of 3 — Treatment Plan</p>
          </div>
          <div className="ml-auto text-right">
            <span className="text-primary font-bold text-sm">100%</span>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
        <div className="w-full h-1 bg-muted">
          <div className="h-full w-full" style={{ backgroundImage: "var(--gradient-primary)" }} />
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Treatment & Care Plan</h2>
          {topCondition && (
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {topCondition.name}
              </span>
              <span className="text-xs text-muted-foreground">
                · {topCondition.severity} · {topCondition.confidence}% confidence
              </span>
            </div>
          )}
          {!topCondition && (
            <p className="text-sm text-success font-semibold mt-2">✅ No significant conditions detected — lungs appear normal</p>
          )}
        </div>

        {plan && (
          <>
            <Section icon={Pill} iconColor="bg-accent" title="Recommended Medications">
              <div className="space-y-3">
                {plan.medications.map((med, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                    <div>
                      <p className="font-bold text-foreground text-sm">{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.instruction}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-accent">{med.frequency}</p>
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
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-background border border-border text-sm">
                    <span className="text-info font-bold">{i + 1}.</span>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={Stethoscope} iconColor="bg-warning" title="Doctor's Recommendations">
              <div className="space-y-2">
                {plan.doctorRecommendations.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-background border border-border text-sm">
                    <span className="text-warning font-bold">{i + 1}</span>
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

        <Button onClick={startNew} className="w-full h-12 text-base font-bold rounded-xl" style={{ backgroundImage: "var(--gradient-primary)" }}>
          <RotateCcw className="w-5 h-5 mr-2" /> Start New Patient Scan
        </Button>
      </main>
      </div>
    </div>
  );
};

export default Treatment;
