"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { cn } from "@/lib/utils";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, Plus, X } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-3">
        <nav
          className={cn(
            "glass rounded-2xl px-4 py-3",
            "flex items-center justify-between gap-4"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-brand-purple flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-sm">DN</span>
            </div>
            <span className="font-bold text-white text-base hidden sm:block">
              DiscordNest
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-colors",
                pathname === "/"
                  ? "text-white bg-white/10"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              Browse
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {status === "loading" ? (
              <div className="w-24 h-9 skeleton rounded-xl" />
            ) : session ? (
              <>
                <Link href="/dashboard/servers/new">
                  <GlassButton variant="primary" size="sm" className="hidden sm:inline-flex">
                    <Plus size={14} />
                    Add Server
                  </GlassButton>
                </Link>
                <Link href="/dashboard">
                  <GlassButton variant="secondary" size="sm" className="hidden sm:inline-flex">
                    <LayoutDashboard size={14} />
                    Dashboard
                  </GlassButton>
                </Link>
                {/* Avatar dropdown trigger */}
                <div className="relative group">
                  <button className="flex items-center gap-2 rounded-xl p-1 hover:bg-white/5 transition-colors">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name ?? ""}
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-purple/40 flex items-center justify-center text-xs text-white font-bold">
                        {(session.user.name ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-40 glass rounded-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-glass">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg mx-1"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg mx-1"
                    >
                      <LogOut size={13} />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={() => signIn("discord")}
              >
                Sign in with Discord
              </GlassButton>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-zinc-400"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="glass rounded-2xl mt-2 p-3 flex flex-col gap-1 md:hidden">
            <Link
              href="/"
              className="px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/5"
              onClick={() => setMobileOpen(false)}
            >
              Browse Servers
            </Link>
            {session && (
              <>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/servers/new"
                  className="px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  Add Server
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
