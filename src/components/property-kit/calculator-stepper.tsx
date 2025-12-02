"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { useDeal } from "@/lib/deal-context";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  { index: 1, label: "PD Assessment", href: "/calculators/pd", shortLabel: "PD" },
  { index: 2, label: "GDV Estimate", href: "/calculators/gdv", shortLabel: "GDV" },
  { index: 3, label: "Build Costs", href: "/calculators/build-cost", shortLabel: "Build" },
  { index: 4, label: "Finance", href: "/calculators/finance", shortLabel: "Finance" },
];

type CalculatorStepperProps = {
  currentStepIndex: number;
};

export function CalculatorStepper({ currentStepIndex }: CalculatorStepperProps) {
  const { currentDeal } = useDeal();
  const router = useRouter();

  const completedStep = currentDeal?.currentStep ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {steps.map((step) => {
        const isActive = step.index === currentStepIndex;
        const isCompleted = step.index < completedStep;
        const isAccessible = step.index <= completedStep + 1;

        const badge = (
          <div
            className={cn(
              "flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "border-[#00C9A7] bg-[#E6FAF7] text-[#00A389] shadow-sm"
                : isCompleted
                  ? "border-green-200 bg-green-50 text-green-600"
                  : isAccessible
                    ? "border-gray-200 bg-white text-gray-600 hover:border-[#00C9A7]/50 hover:bg-[#E6FAF7]/50"
                    : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
            )}
          >
            <span
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                isActive
                  ? "bg-[#00C9A7] text-white"
                  : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-500"
              )}
            >
              {isCompleted ? <Check className="size-3.5" /> : step.index}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
            <span className="sm:hidden">{step.shortLabel}</span>
          </div>
        );

        if (isAccessible && !isActive) {
          return (
            <Link key={step.index} href={step.href} className="no-underline">
              {badge}
            </Link>
          );
        }

        return <div key={step.index}>{badge}</div>;
      })}
    </div>
  );
}

type ContinueButtonProps = {
  nextStep: number;
  disabled?: boolean;
  onBeforeContinue?: () => void;
};

export function ContinueToNextStep({ nextStep, disabled, onBeforeContinue }: ContinueButtonProps) {
  const router = useRouter();

  const nextStepData = steps.find((s) => s.index === nextStep);
  if (!nextStepData) return null;

  const handleClick = () => {
    onBeforeContinue?.();
    router.push(nextStepData.href);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200",
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
          : "border-[#00C9A7] bg-[#E6FAF7] text-[#00A389] hover:bg-[#00C9A7] hover:text-white shadow-sm"
      )}
    >
      Continue to {nextStepData.label}
      <span className="text-xs">→</span>
    </button>
  );
}
