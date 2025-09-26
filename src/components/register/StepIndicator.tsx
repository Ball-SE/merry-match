import { useMemo } from "react";

interface Props {
  currentStep: number;
  titles: string[];
}

export default function StepIndicator({ currentStep, titles }: Props) {
  const steps = useMemo(() => [1, 2, 3], []);
  return (
    <div className="flex items-center justify-center gap-0 select-none">
      {steps.map((s, i) => {
        const active = currentStep === s;
        return (
          <div key={s} className="flex items-center">
            {active ? (
              // Active step - rounded rectangle with title
              <div className="flex items-center gap-2 rounded-xl max-xs:rounded-2xl border-1 max-xs:border-2 border-[#A62D82] bg-white px-8 max-xs:px-4 py-4 max-xs:py-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 ">
                  <span className="text-xl font-bold text-[#A62D82]">{s}</span>
                </div>
                <div className="text-left">
                  <div className="mb-1 text-xs text-gray-500 font-medium">Step {s}/3</div>
                  <div className="text-xl font-bold max-xs:extrabold text-[#A62D82] max-xs:text-xs">{titles[s - 1]}</div>
                </div>
              </div>
            ) : (
              // Inactive step - small circle
              <div className="flex items-center gap-3 rounded-xl max-xs:rounded-2xl border-1 max-xs:border-2 border-gray-300 bg-white px-4 max-xs:px-2 py-4 max-xs:py-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-[#9AA1B9] px-4 py-4">
                  <span className="text-xl font-medium">{s}</span>
                </div>
              </div>
            )}

            {/* Connection line between steps */}
            {i < steps.length - 1 && (
              <div className=" h-px w-4 max-xs:w-2 bg-gray-100" />
            )}
          </div>
        );
      })}
    </div>
  );
}