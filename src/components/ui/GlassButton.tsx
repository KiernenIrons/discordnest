"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/70 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-purple hover:bg-violet-600 text-white shadow-glow hover:shadow-[0_0_28px_rgba(124,58,237,0.55)]",
        secondary:
          "glass text-zinc-100 hover:text-white border-glass hover:border-glass-bright",
        ghost:
          "text-zinc-400 hover:text-white hover:bg-white/5",
        destructive:
          "bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-sm border border-red-500/30",
        join:
          "bg-brand-blue hover:bg-blue-500 text-white font-semibold shadow-glow-blue hover:shadow-[0_0_28px_rgba(59,130,246,0.55)]",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-lg",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg rounded-2xl",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

interface GlassButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

GlassButton.displayName = "GlassButton";
export { GlassButton, buttonVariants };
