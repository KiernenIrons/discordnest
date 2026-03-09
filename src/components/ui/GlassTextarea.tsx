"use client";

import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

const GlassTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full px-4 py-3 rounded-xl",
        "bg-white/5 border border-white/10",
        "text-zinc-100 placeholder:text-zinc-500",
        "backdrop-blur-sm resize-none",
        "focus:outline-none focus:border-brand-purple/60",
        "transition-all duration-200 text-sm leading-relaxed",
        className
      )}
      {...props}
    />
  );
});

GlassTextarea.displayName = "GlassTextarea";
export { GlassTextarea };
