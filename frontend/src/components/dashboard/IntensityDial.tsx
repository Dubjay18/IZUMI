import { useEffect, useState, useRef, useCallback } from "react";

const CIRCUMFERENCE = 2 * Math.PI * 45;

function getIntensityLabel(percent: number): string {
  if (percent <= 20) return "Conservative";
  if (percent <= 40) return "Moderate";
  if (percent <= 60) return "Aggressive";
  if (percent <= 80) return "Aggressive+";
  return "Maximum";
}

interface IntensityDialProps {
  percent: number;
  onChange: (val: number) => void;
}

export function IntensityDial({ percent, onChange }: IntensityDialProps) {
  const [angle, setAngle] = useState((percent / 100) * 360);
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  // Keep angle synced if parent overrides it
  useEffect(() => {
    if (!isDragging) {
      setAngle((percent / 100) * 360);
    }
  }, [percent, isDragging]);

  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * percent) / 100;

  const computeAngle = useCallback((clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Angle in degrees from top (0 deg is top)
    let newAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (newAngle < 0) newAngle += 360;
    
    setAngle(newAngle);
    onChange(Math.round((newAngle / 360) * 100));
  }, [onChange]);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      computeAngle(e.clientX, e.clientY);
    },
    [isDragging, computeAngle]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      e.preventDefault();
    },
    []
  );

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      computeAngle(touch.clientX, touch.clientY);
    },
    [isDragging, computeAngle]
  );

  // Attach global mouse listeners
  const attachedRef = useRef(false);
  if (!attachedRef.current && typeof window !== "undefined") {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    attachedRef.current = true;
  }

  return (
    <div className="flex flex-col items-center justify-center relative py-12">
      <div className="relative w-[360px] h-[360px] flex items-center justify-center">
        {/* Outer decorative rings */}
        <div className="absolute inset-0 rounded-full border border-outline-variant/30 animate-pulse-subtle" />
        <div className="absolute inset-4 rounded-full border border-secondary/20" />

        {/* SVG progress ring */}
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="45"
            stroke="#e7e1dd"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="45"
            stroke="#735c00"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeWidth="4"
            className="transition-all duration-300"
          />
        </svg>

        {/* Draggable knob handle */}
        <div
          ref={dialRef}
          className="dial-knob absolute w-full h-full flex items-center justify-center cursor-pointer"
          style={{ transform: `rotate(${angle}deg)` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        >
          <div className="w-8 h-8 bg-primary rounded-full border-4 border-secondary shadow-lg transform -translate-y-[45px]" />
        </div>

        {/* Center content */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-[12px] font-body font-semibold text-on-surface-variant uppercase tracking-tighter">
            Sweep Intensity
          </span>
          <span className="text-[64px] font-display font-bold text-primary leading-none">
            {percent}%
          </span>
          <span className="font-body text-secondary-fixed-dim bg-primary px-5 py-1 rounded-full text-sm font-semibold mt-2">
            {getIntensityLabel(percent)}
          </span>
        </div>
      </div>
    </div>
  );
}
