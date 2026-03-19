import { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";

interface XrayUploadProps {
  onImageSelect: (base64: string) => void;
  isAnalyzing: boolean;
}

const XrayUpload = ({ onImageSelect, isAnalyzing }: XrayUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        onImageSelect(base64);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearImage = () => setPreview(null);

  return (
    <div className="relative">
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-border card-elevated">
          <img src={preview} alt="X-ray preview" className="w-full max-h-[400px] object-contain bg-background" />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <div className="relative w-full h-full overflow-hidden">
                <div className="absolute inset-x-0 h-1 bg-primary/60 animate-scan" />
              </div>
              <p className="absolute text-primary font-medium animate-pulse">Analyzing...</p>
            </div>
          )}
          {!isAnalyzing && (
            <button
              onClick={clearImage}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-4 p-12 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-300 ${
            dragOver
              ? "border-primary bg-primary/5 glow-primary"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium">Drop your chest X-ray here</p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse · PNG, JPG, DICOM</p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      )}
    </div>
  );
};

export default XrayUpload;
