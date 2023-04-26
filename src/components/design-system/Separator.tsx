import cn from "@/lib/cn";
import React from "react";

export default function Separator({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="w-full border-b border-gray-200" />
      {children && (
        <span className="z-10 mx-4 bg-white text-center text-xs font-medium text-gray-500">
          {children}
        </span>
      )}
      <div className="w-full border-b border-gray-200" />
    </div>
  );
}
