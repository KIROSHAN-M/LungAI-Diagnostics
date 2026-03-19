import samplePneumonia from "@/assets/sample-pneumonia.jpg";
import sampleLungCancer from "@/assets/sample-lungcancer.jpg";
import sampleAsthma from "@/assets/sample-asthma.jpg";
import sampleNormal from "@/assets/sample-normal.jpg";

interface SampleXraysProps {
  onSelect: (base64: string) => void;
  isAnalyzing: boolean;
}

const samples = [
  { name: "Pneumonia", src: samplePneumonia },
  { name: "Lung Cancer", src: sampleLungCancer },
  { name: "Asthma", src: sampleAsthma },
  { name: "Normal", src: sampleNormal },
];

const SampleXrays = ({ onSelect, isAnalyzing }: SampleXraysProps) => {
  const handleClick = async (src: string) => {
    if (isAnalyzing) return;
    // Convert imported image to base64
    const response = await fetch(src);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onSelect(base64);
    };
    reader.readAsDataURL(blob);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Sample X-rays for Testing
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {samples.map((sample) => (
          <button
            key={sample.name}
            onClick={() => handleClick(sample.src)}
            disabled={isAnalyzing}
            className="group relative rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src={sample.src}
              alt={`${sample.name} X-ray sample`}
              className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
            <span className="absolute bottom-2 left-2 text-xs font-medium text-foreground">
              {sample.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SampleXrays;
