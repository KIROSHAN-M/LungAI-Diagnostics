const ScanningAnimation = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div className="relative w-full max-w-xs mx-auto my-6">
      {/* Lungs outline */}
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full text-primary/30">
          <path
            d="M50 15 C50 15 35 20 30 40 C25 60 20 80 35 85 C45 88 48 70 50 60 C52 70 55 88 65 85 C80 80 75 60 70 40 C65 20 50 15 50 15Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        {/* Scan line */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 animate-scan-vertical"
          />
        </div>
        {/* Pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-primary/30 animate-ping-slow" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
        </div>
      </div>
      <p className="text-center text-xs text-primary font-mono mt-3 animate-pulse">SCANNING IN PROGRESS...</p>
    </div>
  );
};

export default ScanningAnimation;
