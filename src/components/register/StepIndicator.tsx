import { useMemo } from "react";

interface Props {
  currentStep: number;
  titles: string[];
}

export default function StepIndicator({ currentStep, titles }: Props) {
  const steps = useMemo(() => [1, 2, 3], []);
  return (
    <div className="flex items-center justify-center gap-4 select-none">
      {steps.map((s, i) => {
        const active = currentStep === s;
        return (
          <div key={s} className="flex items-center">
            {active ? (
              // Active step - rounded rectangle with title
              <div className="flex items-center gap-3 rounded-lg border-2 border-[#A62D82] bg-white px-8 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-[#A62D82]">
                  <span className="text-sm font-bold">{s}</span>
                </div>
                <div className="text-left">
                  <div className="text-xs text-[#7B4429] font-medium">Step {s}/3</div>
                  <div className="text-sm font-bold text-[#A62D82]">{titles[s - 1]}</div>
                </div>
              </div>
            ) : (
              // Inactive step - small circle
              <div className="flex items-center gap-3 rounded-lg border-1 border-gray-300 bg-white px-2 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-[#9AA1B9] px-4 py-4">
                  <span className="text-sm font-medium">{s}</span>
                </div>
              </div>
            )}

            {/* Connection line between steps */}
            {i < steps.length - 1 && (
              <div className="mx-4 h-px w-8 bg-gray-100" />
            )}
          </div>
        );
      })}
    </div>
  );
}