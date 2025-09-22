import { useMemo } from "react";

interface Props {
  currentStep: number;
  titles: string[];
}

export default function StepIndicator({ currentStep, titles }: Props) {
  const steps = useMemo(() => [1, 2, 3], []);
  return (
    <div className="flex items-center gap-4 select-none">
      {steps.map((s, i) => {
        const active = currentStep === s;
        return (
          <div key={s} className="flex items-center">
            {active ? (
              // Active step - rounded rectangle with title
              <div className="flex items-center gap-3 rounded-lg border-2 border-[#C70039] bg-white px-4 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C70039] text-white">
                  <span className="text-sm font-bold">{s}</span>
                </div>
                <div className="text-left">
                  <div className="text-xs text-[#C70039] font-medium">Step {s}/3</div>
                  <div className="text-sm font-semibold text-[#2A0B21]">{titles[s - 1]}</div>
                </div>
              </div>
            ) : (
              // Inactive step - small circle
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E4E6ED] text-[#9AA1B9]">
                <span className="text-sm font-medium">{s}</span>
              </div>
            )}
            
            {/* Connection line between steps */}
            {i < steps.length - 1 && (
              <div className="mx-4 h-px w-8 bg-[#E4E6ED]" />
            )}
          </div>
        );
      })}
    </div>
  );
}