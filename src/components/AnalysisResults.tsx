import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

export interface ConditionResult {
  name: string;
  confidence: number;
  severity: string;
  findings: string[];
}

export interface AnalysisData {
  conditions: ConditionResult[];
  overallAssessment: string;
  recommendation: string;
}

const getSeverityColor = (severity: string) => {
  const s = severity.toLowerCase();
  if (s === "none" || s === "normal") return "text-success";
  if (s === "mild" || s === "low") return "text-info";
  if (s === "moderate" || s === "medium") return "text-warning";
  return "text-destructive";
};

const getSeverityIcon = (severity: string) => {
  const s = severity.toLowerCase();
  if (s === "none" || s === "normal") return <CheckCircle className="w-5 h-5 text-success" />;
  if (s === "mild" || s === "low") return <Info className="w-5 h-5 text-info" />;
  if (s === "moderate" || s === "medium") return <AlertTriangle className="w-5 h-5 text-warning" />;
  return <XCircle className="w-5 h-5 text-destructive" />;
};

const getConfidenceBarColor = (confidence: number) => {
  if (confidence < 25) return "bg-success";
  if (confidence < 50) return "bg-info";
  if (confidence < 75) return "bg-warning";
  return "bg-destructive";
};

const AnalysisResults = ({ data }: { data: AnalysisData }) => {
  const sortedConditions = [...data.conditions].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Diagnosis Results</h2>

      <div className="space-y-3">
        {sortedConditions.map((condition) => (
          <div key={condition.name} className="rounded-lg border border-border card-elevated p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getSeverityIcon(condition.severity)}
                <span className="font-semibold text-foreground">{condition.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${getSeverityColor(condition.severity)}`}>
                  {condition.severity}
                </span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {condition.confidence}%
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getConfidenceBarColor(condition.confidence)}`}
                style={{ width: `${condition.confidence}%` }}
              />
            </div>
            <ul className="space-y-1">
              {condition.findings.map((finding, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
        <h3 className="font-semibold text-primary text-sm uppercase tracking-wider">Assessment</h3>
        <p className="text-sm text-foreground">{data.overallAssessment}</p>
      </div>

      <div className="rounded-lg border border-info/30 bg-info/5 p-4 space-y-2">
        <h3 className="font-semibold text-info text-sm uppercase tracking-wider">Recommendation</h3>
        <p className="text-sm text-foreground">{data.recommendation}</p>
      </div>

      <p className="text-xs text-muted-foreground text-center italic">
        ⚠️ This AI analysis is for educational purposes only. Always consult a qualified radiologist for clinical decisions.
      </p>
    </div>
  );
};

export default AnalysisResults;
