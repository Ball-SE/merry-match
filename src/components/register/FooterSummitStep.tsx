import Image from "next/image";
interface Props {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
}

export default function FooterSummitStep({
  currentStep,
  totalSteps,
  canProceed,
  onBack,
  onNext,
}: Props) {
  const isFirst = currentStep === 1;
  const isLast = currentStep === totalSteps;

  return (
    <div className="mt-10 flex items-center justify-between border-t border-[#E4E6ED] pt-6">
      <span className="text-sm text-[#7B819C]">
        {currentStep}/{totalSteps}
      </span>
      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={isFirst}
          className={`flex gap-2 button-ghost group ${isFirst
              ? "cursor-not-allowed text-gray-300"
              : "text-[#C70039] hover:text-gray-300"
            }`}
        >
          {/* Default icon (normal), hide on hover; hidden entirely if first step */}
          <Image
            src="/assets/backArrow.svg"
            alt="Back arrow"
            width={12}
            height={12}
            className={`${isFirst ? "hidden" : "inline"} group-hover:hidden`}
          />
          {/* Ghost icon, shown when first step or on hover */}
          <Image
            src="/assets/backArrowGhost.svg"
            alt="Back arrow (hover)"
            width={12}
            height={12}
            className={`${isFirst ? "inline" : "hidden"} group-hover:inline`}
          />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`button-primary ${canProceed
              ? "bg-[#C70039] text-white hover:bg-[#950028]"
              : "button-disabled cursor-not-allowed"
            }`}
        >
          {isLast ? "Confirm" : "Next step"}
        </button>
      </div>
    </div>
  );
}
