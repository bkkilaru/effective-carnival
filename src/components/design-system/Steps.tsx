// Steps.tsx
import cn from "@/lib/cn";
import React from "react";
import { Button } from "./Button";

interface Step {
  id: string;
  name: string;
}

interface StepsProps {
  steps: Step[];
  activeStepId: string;
  onSelectStep?: (step: Step) => void;
}

const Steps: React.FC<StepsProps> = ({ steps, activeStepId, onSelectStep }) => {
  return (
    <div className="relative flex w-full flex-col py-2">
      <div className="absolute left-[15px] top-[28px] h-[60%] border-l border-gray-200 py-2" />
      <div className="flex flex-col space-y-1">
        {steps.map((step) => (
          <div key={step.id} className={cn(`ml-4 flex items-center`)}>
            <div
              className={cn(`z-10 -ml-[3.5px] mr-2 h-1.5 w-1.5 rounded-full`, {
                "bg-black font-medium": step.id === activeStepId,
                "bg-gray-200 font-normal": step.id !== activeStepId,
              })}
            />
            <Button
              size="sm"
              variant={"subtle"}
              className={cn("block w-full py-1 text-left", {
                "font-medium text-black": step.id === activeStepId,
                "font-normal text-gray-400": step.id !== activeStepId,
              })}
              onClick={() => onSelectStep?.(step)}
            >
              {step.name}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Steps;
