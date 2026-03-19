import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, HeartPulse, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PatientData {
  fullName: string;
  age: string;
  height: string;
  weight: string;
  gender: string;
  bloodPressure: string;
  currentProblem: string;
  symptoms: string;
  smokingHistory: string;
  asthma: string;
  previousRespiratory: string;
  knownAllergies: string;
}

const PatientInfo = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PatientData>({
    fullName: "", age: "", height: "", weight: "", gender: "",
    bloodPressure: "", currentProblem: "", symptoms: "",
    smokingHistory: "Never", asthma: "No",
    previousRespiratory: "None", knownAllergies: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PatientData, string>>>({});

  const update = (field: keyof PatientData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!data.fullName.trim()) errs.fullName = "Name is required";
    const age = Number(data.age);
    if (!data.age || isNaN(age) || age < 0 || age > 150) errs.age = "Enter a valid age (0-150)";
    const h = Number(data.height);
    if (!data.height || isNaN(h) || h < 30 || h > 280) errs.height = "Enter valid height (30-280 cm)";
    const w = Number(data.weight);
    if (!data.weight || isNaN(w) || w < 1 || w > 500) errs.weight = "Enter valid weight (1-500 kg)";
    if (!data.gender) errs.gender = "Select gender";
    if (!data.currentProblem.trim()) errs.currentProblem = "Describe the problem";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the errors before proceeding");
      return false;
    }
    return true;
  };

  const proceed = () => {
    if (!validate()) return;
    // Store patient data for use in analysis
    sessionStorage.setItem("patientData", JSON.stringify(data));
    navigate("/scan");
  };

  const ToggleGroup = ({
    label, options, value, onChange,
  }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              value === opt
                ? "bg-primary text-primary-foreground"
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Step 1 of 3</p>
            <h1 className="text-2xl font-bold text-foreground">Patient Information</h1>
          </div>
          <div className="text-right">
            <span className="text-primary font-bold">0%</span>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full mb-8">
          <div className="h-full w-[33%] rounded-full" style={{ backgroundImage: "var(--gradient-primary)" }} />
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="card-elevated rounded-xl p-6 space-y-5 border border-border">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">Basic Information</h2>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input placeholder="John Doe" value={data.fullName} onChange={(e) => update("fullName", e.target.value)} className="bg-background" />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Age</Label>
                <Input type="number" placeholder="45" value={data.age} onChange={(e) => update("age", e.target.value)} className="bg-background" />
                {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Height (cm)</Label>
                <Input type="number" placeholder="170" value={data.height} onChange={(e) => update("height", e.target.value)} className="bg-background" />
                {errors.height && <p className="text-xs text-destructive">{errors.height}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weight (kg)</Label>
                <Input type="number" placeholder="70" value={data.weight} onChange={(e) => update("weight", e.target.value)} className="bg-background" />
                {errors.weight && <p className="text-xs text-destructive">{errors.weight}</p>}
              </div>
            </div>

            <ToggleGroup label="Gender" options={["Male", "Female", "Other"]} value={data.gender} onChange={(v) => update("gender", v)} />
            {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Blood Pressure</Label>
              <Input placeholder="120/80 mmHg" value={data.bloodPressure} onChange={(e) => update("bloodPressure", e.target.value)} className="bg-background" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Problem</Label>
              <Input placeholder="Persistent cough, chest pain..." value={data.currentProblem} onChange={(e) => update("currentProblem", e.target.value)} className="bg-background" />
              {errors.currentProblem && <p className="text-xs text-destructive">{errors.currentProblem}</p>}
            </div>
          </div>

          {/* Clinical History */}
          <div className="card-elevated rounded-xl p-6 space-y-5 border border-border">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <HeartPulse className="w-5 h-5 text-accent" />
              </div>
              <h2 className="font-semibold text-foreground">Clinical History</h2>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Symptoms</Label>
              <Textarea placeholder="Shortness of breath, fever, wheezing, fatigue..." value={data.symptoms} onChange={(e) => update("symptoms", e.target.value)} className="bg-background min-h-[80px]" />
            </div>

            <ToggleGroup label="Smoking History" options={["Never", "Former", "Current"]} value={data.smokingHistory} onChange={(v) => update("smokingHistory", v)} />
            <ToggleGroup label="Asthma" options={["No", "Mild", "Moderate", "Severe"]} value={data.asthma} onChange={(v) => update("asthma", v)} />
            <ToggleGroup label="Previous Respiratory Issues" options={["None", "Asthma", "COPD", "Other"]} value={data.previousRespiratory} onChange={(v) => update("previousRespiratory", v)} />

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Known Allergies</Label>
              <Textarea placeholder="Penicillin, dust, pollen..." value={data.knownAllergies} onChange={(e) => update("knownAllergies", e.target.value)} className="bg-background min-h-[80px]" />
            </div>
          </div>
        </div>

        {/* Proceed button */}
        <div className="flex justify-end mt-8">
          <Button onClick={proceed} className="h-12 px-8 text-base font-semibold" style={{ backgroundImage: "var(--gradient-primary)" }}>
            Proceed to Lung Analysis <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;
