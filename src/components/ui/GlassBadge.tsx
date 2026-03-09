import { cn } from "@/lib/utils";

interface GlassBadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function GlassBadge({
  children,
  color,
  className,
  onClick,
  active,
}: GlassBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
        "border transition-all duration-150",
        active
          ? "bg-brand-purple/20 border-brand-purple/50 text-violet-300"
          : "bg-white/5 border-white/10 text-zinc-400",
        onClick && "cursor-pointer hover:border-white/25 hover:text-zinc-200",
        className
      )}
      style={
        color && !active
          ? {
              borderColor: `${color}33`,
              color: color,
              backgroundColor: `${color}15`,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
