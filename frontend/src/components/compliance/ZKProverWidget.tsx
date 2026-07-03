import { useState, useCallback } from "react";

const STEPS = [
  { icon: "person_check", label: "Identity", active: true },
  { icon: "generating_tokens", label: "Generation", active: false },
  { icon: "verified", label: "Verification", active: false },
] as const;

export function ZKProverWidget() {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div className="glass-panel p-12 rounded-xl text-center relative overflow-hidden">
      {/* Shield Animation */}
      <div className="mb-10 relative h-48 flex items-center justify-center">
        <div className="absolute w-32 h-32 bg-primary/5 rounded-full animate-ping-slow opacity-20" />
        <div className="absolute w-40 h-40 border border-primary-fixed/30 rounded-full" />
        <div className="z-10 w-24 h-24 bg-primary text-secondary-container rounded-full flex items-center justify-center shadow-xl">
          <span
            className="material-symbols-outlined text-[48px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            shield_lock
          </span>
        </div>
        {/* Parabolic SVG paths */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          viewBox="0 0 400 200"
        >
          <path
            className="text-primary"
            d="M50,150 Q200,20 350,150"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            className="text-primary"
            d="M20,180 Q200,0 380,180"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Heading */}
      <div className="max-w-md mx-auto space-y-2">
        <h1 className="font-display text-[32px] font-semibold text-primary leading-tight">
          Compliance Shield
        </h1>
        <p className="text-on-surface-variant font-body leading-relaxed">
          Generate a zero-knowledge proof of regulatory standing without
          revealing your underlying sensitive data.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="mt-12 flex items-center justify-center gap-4 max-w-lg mx-auto">
        {STEPS.map((step, index) => (
          <div key={step.label} className="contents">
            <div className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.active
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-outline"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {step.icon}
                </span>
              </div>
              <span
                className={`text-[12px] font-body ${
                  step.active
                    ? "font-bold text-primary"
                    : "font-semibold text-on-surface-variant"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className="w-12 h-[2px] bg-outline-variant mb-6" />
            )}
          </div>
        ))}
      </div>

      {/* Action Area */}
      <div className="mt-12 p-8 bg-surface-container-low rounded-lg border border-outline-variant/30 space-y-6">
        <div className="flex items-center justify-between text-left">
          <div>
            <p className="text-[12px] font-body font-bold text-primary">
              KYC Hash Validated
            </p>
            <p className="text-[12px] font-body text-on-surface-variant italic">
              Izumi-Internal-0041-X
            </p>
          </div>
          <span className="material-symbols-outlined text-surface-tint">
            check_circle
          </span>
        </div>
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`w-full bg-primary text-secondary-container py-4 px-8 rounded-full text-[14px] font-body font-semibold uppercase tracking-[0.15em] hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 ${
            isHovered ? "shimmer" : ""
          }`}
        >
          SUBMIT PRIVACY SHIELD
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">
          Gas-less transaction powered by Izumi Relayer
        </p>
      </div>
    </div>
  );
}
