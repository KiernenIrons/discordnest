"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
            {icon}
          </span>
          <input
            ref={ref}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl",
              "bg-white/5 border border-white/10",
              "text-zinc-100 placeholder:text-zinc-500",
              "backdrop-blur-sm",
              "focus:outline-none focus:border-brand-purple/60 focus:bg-white/8",
              "transition-all duration-200 text-sm",
              className
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl",
          "bg-white/5 border border-white/10",
          "text-zinc-100 placeholder:text-zinc-500",
          "backdrop-blur-sm",
          "focus:outline-none focus:border-brand-purple/60 focus:bg-white/8",
          "transition-all duration-200 text-sm",
          className
        )}
        {...props}
      />
    );
  }
);

GlassInput.displayName = "GlassInput";
export { GlassInput };
