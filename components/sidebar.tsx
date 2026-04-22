"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutGrid,
  CheckSquare,
  Inbox,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  workspaces: { id: string; name: string }[];
}

const userNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "My Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Inbox", href: "/inbox", icon: Inbox },
];

const workspaceNavigation = [
  { name: "Overview", segment: "" },
  { name: "Boards", segment: "/boards" },
  { name: "Sprints", segment: "/sprints" },
  { name: "Team", segment: "/team" },
];

export function Sidebar({ user, workspaces }: SidebarProps) {
  const pathname = usePathname();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const workspaceMatch = pathname.match(/^\/workspaces\/([^/]+)/);
  const activeWorkspaceId = workspaceMatch?.[1] ?? workspaces[0]?.id;
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-bg-elevated/60 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo size={22} />
          <span className="font-mono text-sm font-bold tracking-tight text-accent">
            Crest
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* User navigation */}
      <nav className="space-y-0.5 px-2 pt-3 pb-2">
        {userNavigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "border-transparent text-fg-secondary hover:bg-bg-secondary hover:text-fg-primary"
              }`}
            >
              <item.icon size={14} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="relative mx-3">
        <div className="border-t border-border" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="h-1.5 w-1.5 rounded-full bg-accent-subtle" />
        </div>
      </div>

      {/* Workspace section */}
      <div className="flex-1 overflow-y-auto px-2 pt-3">
        <p className="mb-1.5 px-2.5 text-[10px] font-medium uppercase tracking-widest text-accent-subtle">
          Workspace
        </p>
        <div className="relative mb-2">
          <button
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="flex w-full items-center justify-between rounded-md border border-border-subtle px-2.5 py-1.5 text-xs font-medium text-fg-primary transition-colors hover:border-accent/30 hover:text-accent"
          >
            <span className="truncate">
              {activeWorkspace?.name ?? "No workspace"}
            </span>
            <ChevronDown
              size={12}
              className={`transition-transform ${workspaceOpen ? "rotate-180" : ""}`}
            />
          </button>

          {workspaceOpen && workspaces.length > 0 && (
            <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-md border border-border bg-bg-elevated p-1 shadow-lg shadow-accent/5">
              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/workspaces/${ws.id}`}
                  onClick={() => setWorkspaceOpen(false)}
                  className={`block rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                    ws.id === activeWorkspaceId
                      ? "bg-accent/10 text-accent"
                      : "text-fg-secondary hover:bg-bg-secondary hover:text-fg-primary"
                  }`}
                >
                  {ws.name}
                </Link>
              ))}
              <div className="mt-1 border-t border-border pt-1">
                <Link
                  href="/workspaces"
                  onClick={() => setWorkspaceOpen(false)}
                  className="block rounded-md px-2.5 py-1.5 text-xs text-fg-muted transition-colors hover:bg-bg-secondary hover:text-fg-primary"
                >
                  All workspaces →
                </Link>
              </div>
            </div>
          )}
        </div>

        {activeWorkspace && (
          <nav className="space-y-0.5">
            {workspaceNavigation.map((item) => {
              const href = `/workspaces/${activeWorkspaceId}${item.segment}`;
              const isActive =
                item.segment === ""
                  ? pathname === href
                  : pathname.startsWith(href);
              return (
                <Link
                  key={item.name}
                  href={href}
                  className={`block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-fg-secondary hover:bg-bg-secondary hover:text-fg-primary"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-emphasis/15 font-mono text-xs font-bold text-accent-emphasis">
            {user.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-fg-primary">
              {user.name}
            </p>
            <p className="truncate text-[10px] text-fg-muted">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="shrink-0 rounded-md p-1 text-fg-muted transition-colors hover:bg-bg-secondary hover:text-accent-emphasis"
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
