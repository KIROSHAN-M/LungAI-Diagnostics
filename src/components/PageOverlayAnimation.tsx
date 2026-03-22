import { Stethoscope, Pill, Activity, Heart, Scan } from "lucide-react";

type PageType = "login" | "patient" | "scan" | "treatment";

const animations: Record<PageType, React.ReactNode> = {
  login: (
    <>
      {/* Floating heartbeat line */}
      <svg className="absolute bottom-16 left-0 w-full h-20 opacity-[0.15]" viewBox="0 0 400 50" preserveAspectRatio="none">
        <polyline
          points="0,25 80,25 100,5 115,45 130,25 160,25 180,10 195,40 210,25 400,25"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className="animate-ecg"
        />
      </svg>
      <div className="absolute top-1/4 right-12 opacity-[0.15] animate-float">
        <Heart className="w-28 h-28 text-primary" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-1/3 left-10 opacity-[0.12] animate-pulse">
        <Activity className="w-24 h-24 text-primary" strokeWidth={1.5} />
      </div>
      {/* Large stethoscope — prominently visible */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.12] animate-swing origin-top">
        <Stethoscope className="w-48 h-48 text-primary" strokeWidth={1} />
      </div>
    </>
  ),
  patient: (
    <>
      <div className="absolute bottom-8 right-8 opacity-[0.18] animate-swing origin-top">
        <Stethoscope className="w-44 h-44 text-primary" strokeWidth={1.5} />
      </div>
      <div className="absolute top-1/3 left-6 opacity-[0.12] animate-float" style={{ animationDelay: "1s" }}>
        <Heart className="w-20 h-20 text-primary" strokeWidth={1.5} />
      </div>
      {/* Pulse ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]">
        <div className="w-72 h-72 rounded-full border-2 border-primary animate-ping-slow" />
      </div>
      <div className="absolute top-16 right-16 opacity-[0.1] animate-float" style={{ animationDelay: "2s" }}>
        <Activity className="w-16 h-16 text-primary" strokeWidth={1.5} />
      </div>
    </>
  ),
  scan: (
    <>
      {/* Scanning sweep */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.12] pointer-events-none">
        <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-vertical" />
      </div>
      {/* Lungs watermark */}
      <div className="absolute bottom-10 right-10 opacity-[0.14]">
        <svg viewBox="0 0 100 100" className="w-48 h-48 text-primary animate-float">
          <path
            d="M50 15 C50 15 35 20 30 40 C25 60 20 80 35 85 C45 88 48 70 50 60 C52 70 55 88 65 85 C80 80 75 60 70 40 C65 20 50 15 50 15Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <div className="absolute top-1/4 left-8 opacity-[0.12] animate-pulse">
        <Scan className="w-24 h-24 text-primary" strokeWidth={1.5} />
      </div>
      <div className="absolute top-16 right-20 opacity-[0.1] animate-float" style={{ animationDelay: "1.5s" }}>
        <Stethoscope className="w-20 h-20 text-primary" strokeWidth={1} />
      </div>
    </>
  ),
  treatment: (
    <>
      <div className="absolute bottom-12 right-12 opacity-[0.15] animate-float">
        <Pill className="w-32 h-32 text-primary" strokeWidth={1.5} />
      </div>
      <div className="absolute top-1/4 left-10 opacity-[0.12] animate-float" style={{ animationDelay: "1.5s" }}>
        <Heart className="w-20 h-20 text-primary" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-1/4 left-1/4 opacity-[0.14] animate-swing origin-top">
        <Stethoscope className="w-28 h-28 text-primary" strokeWidth={1} />
      </div>
      {/* ECG line */}
      <svg className="absolute bottom-20 left-0 w-full h-16 opacity-[0.12]" viewBox="0 0 400 50" preserveAspectRatio="none">
        <polyline
          points="0,25 80,25 100,5 115,45 130,25 160,25 180,10 195,40 210,25 400,25"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className="animate-ecg"
        />
      </svg>
    </>
  ),
};

const PageOverlayAnimation = ({ page }: { page: PageType }) => (
  <div className="fixed inset-0 z-[1] pointer-events-none select-none overflow-hidden">
    {animations[page]}
  </div>
);

export default PageOverlayAnimation;
