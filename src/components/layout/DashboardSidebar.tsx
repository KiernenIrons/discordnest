"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Plus, Server, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/servers", label: "My Servers", icon: Server },
  { href: "/dashboard/servers/new", label: "Add Server", icon: Plus },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0">
      <div className="glass rounded-2xl p-3 flex flex-col gap-1 sticky top-24">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 py-2">
          Dashboard
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                active
                  ? "bg-brand-purple/20 text-violet-300 border border-brand-purple/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
