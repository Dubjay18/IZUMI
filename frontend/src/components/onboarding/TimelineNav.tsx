const STEPS = [
  {
    key: "identity",
    title: "Personal Identity",
    subtitle: "Core details and legal residency",
  },
  {
    key: "kyc",
    title: "Financial Profile",
    subtitle: "Investment goals and horizon",
  },
  {
    key: "success",
    title: "Security Deposit",
    subtitle: "Fund your initial fountain allocation",
  },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

interface TimelineNavProps {
  currentStep: StepKey;
}

export function TimelineNav({ currentStep }: TimelineNavProps) {
  const activeIdx = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <nav className="flex flex-col gap-10 relative">
      {STEPS.map((step, i) => {
        const isActive = i === activeIdx;
        const isComplete = i < activeIdx;

        return (
          <div key={step.key} className="flex gap-6 relative">
            {i < STEPS.length - 1 && (
              <div className={`timeline-line ${isComplete ? "" : "opacity-30"}`} />
            )}
            <div
              className={`z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                isActive
                  ? "bg-primary shadow-lg shadow-primary/20"
                  : "border border-outline-variant bg-surface"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive
                    ? "bg-secondary-fixed"
                    : "bg-outline-variant"
                }`}
              />
            </div>
            <div className={isActive ? "" : "opacity-50"}>
              <span className="font-subhead-caps text-subhead-caps text-secondary uppercase block mb-1">
                Step {i + 1} of 3
              </span>
              <h3
                className={`font-headline-md text-[20px] font-semibold ${
                  isActive ? "text-primary" : "text-on-surface"
                }`}
              >
                {step.title}
              </h3>
              <p className="font-label-sm text-on-surface-variant mt-1">
                {step.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
