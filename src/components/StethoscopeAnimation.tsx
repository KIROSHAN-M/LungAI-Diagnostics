import { Stethoscope } from "lucide-react";

const StethoscopeAnimation = () => (
  <div className="fixed bottom-8 right-8 z-0 opacity-10 pointer-events-none select-none">
    <div className="animate-swing origin-top">
      <Stethoscope className="w-32 h-32 text-primary" strokeWidth={1} />
    </div>
  </div>
);

export default StethoscopeAnimation;
