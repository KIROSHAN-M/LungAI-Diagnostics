import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, HeartPulse, ArrowRight, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PageOverlayAnimation from "@/components/PageOverlayAnimation";
import { playClick, playType, playSuccess, playError, playNavigate } from "@/hooks/useSoundEffects";
import bgPatient from "@/assets/bg-patient.jpg";

// Gibberish detection: checks for too many consonant clusters, no vowels, or random chars
const isGibberish = (text: string): boolean => {
  const cleaned = text.trim().toLowerCase();
  if (cleaned.length < 3) return false;
  // Check vowel ratio — meaningful English text has ~35%+ vowels
  const vowels = cleaned.replace(/[^aeiouy]/g, "").length;
  const letters = cleaned.replace(/[^a-z]/g, "").length;
  if (letters > 5 && vowels / letters < 0.15) return true;
  // Check for long consonant clusters (5+ in a row)
  if (/[^aeiouy\s\d.,;:!?'-]{5,}/i.test(cleaned)) return true;
  // Check if mostly non-alpha (excluding spaces/punctuation)
  const alpha = cleaned.replace(/[^a-z\s]/g, "").length;
  if (cleaned.length > 5 && alpha / cleaned.length < 0.5) return true;
  return false;
};

interface PatientData {
  fullName: string; age: string; height: string; weight: string; gender: string;
  bloodPressure: string; currentProblem: string; symptoms: string;
  smokingHistory: string; asthma: string; previousRespiratory: string; knownAllergies: string;
}

const PatientInfo = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PatientData>({
    fullName: "", age: "", height: "", weight: "", gender: "",
    bloodPressure: "", currentProblem: "", symptoms: "",
    smokingHistory: "Never", asthma: "No", previousRespiratory: "None", knownAllergies: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PatientData, string>>>({});

  const update = (field: keyof PatientData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!data.fullName.trim()) errs.fullName = "Name is required";
    else if (isGibberish(data.fullName)) errs.fullName = "Please enter a valid name";
    const age = Number(data.age);
    if (!data.age || isNaN(age) || age < 0 || age > 150) errs.age = "Enter a valid age (0-150)";
    const h = Number(data.height);
    if (!data.height || isNaN(h) || h < 30 || h > 280) errs.height = "Enter valid height (30-280 cm)";
    const w = Number(data.weight);
    if (!data.weight || isNaN(w) || w < 1 || w > 500) errs.weight = "Enter valid weight (1-500 kg)";
    if (!data.gender) errs.gender = "Select gender";
    if (!data.currentProblem.trim()) errs.currentProblem = "Describe the problem";
    else if (isGibberish(data.currentProblem)) errs.currentProblem = "Please enter a meaningful description";
    if (data.symptoms.trim() && isGibberish(data.symptoms)) errs.symptoms = "Please enter valid symptoms";
    if (data.bloodPressure.trim() && !/^\d{2,3}\/\d{2,3}/.test(data.bloodPressure.trim()) && isGibberish(data.bloodPressure))
      errs.bloodPressure = "Enter valid blood pressure (e.g. 120/80 mmHg)";
    if (data.knownAllergies.trim() && isGibberish(data.knownAllergies)) errs.knownAllergies = "Please enter valid allergy information";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      playError();
      toast.error("Please fix the errors before proceeding");
      return false;
    }
    return true;
  };

  const proceed = () => {
    playClick();
    if (!validate()) return;
    playSuccess();
    playNavigate();
    sessionStorage.setItem("patientData", JSON.stringify(data));
    navigate("/scan");
  };

  const ToggleGroup = ({
    label, options, value, onChange,
  }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-2">
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => { onChange(opt); playClick(); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 ${
              value === opt
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={bgPatient} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      </div>
      <PageOverlayAnimation page="patient" />
      <div className="relative z-10">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 animate-pulse-glow">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">LungAI Diagnostics</h1>
              <p className="text-xs text-muted-foreground">Step 1 of 3 — Patient Information</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-primary font-bold text-sm">33%</span>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
          <div className="w-full h-1 bg-muted">
            <div className="h-full w-[33%] transition-all" style={{ backgroundImage: "var(--gradient-primary)" }} />
          </div>
        </header>

        <main className="container max-w-5xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="card-elevated rounded-2xl p-6 space-y-5 border border-border animate-fade-up">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-bold text-foreground">Basic Information</h2>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input placeholder="John Doe" value={data.fullName} onChange={(e) => { update("fullName", e.target.value); playType(); }} className="bg-background rounded-xl h-11" />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age</Label>
                  <Input type="number" placeholder="45" value={data.age} onChange={(e) => { update("age", e.target.value); playType(); }} className="bg-background rounded-xl h-11" />
                  {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Height (cm)</Label>
                  <Input type="number" placeholder="170" value={data.height} onChange={(e) => { update("height", e.target.value); playType(); }} className="bg-background rounded-xl h-11" />
                  {errors.height && <p className="text-xs text-destructive">{errors.height}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weight (kg)</Label>
                  <Input type="number" placeholder="70" value={data.weight} onChange={(e) => { update("weight", e.target.value); playType(); }} className="bg-background rounded-xl h-11" />
                  {errors.weight && <p className="text-xs text-destructive">{errors.weight}</p>}
                </div>
              </div>

              <ToggleGroup label="Gender" options={["Male", "Female", "Other"]} value={data.gender} onChange={(v) => update("gender", v)} />
              {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Blood Pressure</Label>
                <Input placeholder="120/80 mmHg" value={data.bloodPressure} onChange={(e) => { update("bloodPressure", e.target.value); playType(); }} className="bg-background rounded-xl h-11" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Problem</Label>
                <Input placeholder="Persistent cough, chest pain..." value={data.currentProblem} onChange={(e) => { update("currentProblem", e.target.value); playType(); }} className="bg-background rounded-xl h-11" />
                {errors.currentProblem && <p className="text-xs text-destructive">{errors.currentProblem}</p>}
              </div>
            </div>

            {/* Clinical History */}
            <div className="card-elevated rounded-2xl p-6 space-y-5 border border-border animate-fade-up" style={{ animationDelay: "0.15s" }}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accent/10">
                  <HeartPulse className="w-5 h-5 text-accent" />
                </div>
                <h2 className="font-bold text-foreground">Clinical History</h2>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Symptoms</Label>
                <Textarea placeholder="Shortness of breath, fever, wheezing, fatigue..." value={data.symptoms} onChange={(e) => { update("symptoms", e.target.value); playType(); }} className="bg-background min-h-[80px] rounded-xl" />
              </div>

              <ToggleGroup label="Smoking History" options={["Never", "Former", "Current"]} value={data.smokingHistory} onChange={(v) => update("smokingHistory", v)} />
              <ToggleGroup label="Asthma" options={["No", "Mild", "Moderate", "Severe"]} value={data.asthma} onChange={(v) => update("asthma", v)} />
              <ToggleGroup label="Previous Respiratory Issues" options={["None", "Asthma", "COPD", "Other"]} value={data.previousRespiratory} onChange={(v) => update("previousRespiratory", v)} />

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Known Allergies</Label>
                <Textarea placeholder="Penicillin, dust, pollen..." value={data.knownAllergies} onChange={(e) => { update("knownAllergies", e.target.value); playType(); }} className="bg-background min-h-[80px] rounded-xl" />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button onClick={proceed} className="h-12 px-8 text-base font-bold rounded-xl transition-transform hover:scale-[1.02] active:scale-95" style={{ backgroundImage: "var(--gradient-primary)" }}>
              Proceed to Lung Analysis <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientInfo;
