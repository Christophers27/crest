"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { ThemeToggle } from "@/app/_components/theme-toggle";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  workspaces: { id: string; name: string }[];
}

const userNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: GridIcon },
  { name: "My Tasks", href: "/tasks", icon: CheckIcon },
  { name: "Inbox", href: "/inbox", icon: InboxIcon },
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

  // Derive active workspace from URL
  const workspaceMatch = pathname.match(/^\/workspaces\/([^/]+)/);
  const activeWorkspaceId = workspaceMatch?.[1] ?? workspaces[0]?.id;
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-bg-elevated/60 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <Link
          href="/dashboard"
          className="font-mono text-sm font-semibold tracking-tight text-fg-primary"
        >
          crest
        </Link>
        <ThemeToggle />
      </div>

      {/* User navigation */}
      <nav className="space-y-0.5 px-2 pt-3 pb-2">
        {userNavigation.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-accent-mid/10 text-accent-mid"
                  : "text-fg-secondary hover:bg-bg-secondary hover:text-fg-primary"
              }`}
            >
              <item.icon active={isActive} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-border" />

      {/* Workspace section */}
      <div className="flex-1 overflow-y-auto px-2 pt-3">
        <div className="relative mb-2">
          <button
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-fg-muted transition-colors hover:text-fg-secondary"
          >
            <span className="truncate font-medium uppercase tracking-wider">
              {activeWorkspace?.name ?? "No workspace"}
            </span>
            <ChevronIcon open={workspaceOpen} />
          </button>

          {workspaceOpen && workspaces.length > 0 && (
            <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-md border border-border bg-bg-elevated p-1 shadow-lg">
              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/workspaces/${ws.id}`}
                  onClick={() => setWorkspaceOpen(false)}
                  className={`block rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                    ws.id === activeWorkspaceId
                      ? "bg-accent-mid/10 text-accent-mid"
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
                  All workspaces
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
                      ? "bg-accent-mid/10 text-accent-mid"
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
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-mid/15 text-xs font-medium text-accent-mid">
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
            className="shrink-0 rounded-md p-1 text-fg-muted transition-colors hover:bg-bg-secondary hover:text-fg-secondary"
            aria-label="Sign out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path
                fillRule="evenodd"
                d="M2 4.75A2.75 2.75 0 0 1 4.75 2h3a2.75 2.75 0 0 1 2.75 2.75v.5a.75.75 0 0 1-1.5 0v-.5c0-.69-.56-1.25-1.25-1.25h-3C4.06 3.5 3.5 4.06 3.5 4.75v6.5c0 .69.56 1.25 1.25 1.25h3c.69 0 1.25-.56 1.25-1.25v-.5a.75.75 0 0 1 1.5 0v.5A2.75 2.75 0 0 1 7.75 14h-3A2.75 2.75 0 0 1 2 11.25v-6.5Zm9.47.47a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H6.5a.75.75 0 0 1 0-1.5h5.94l-.97-.97a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ─── Icon Components ──────────────────────────────────────────────────── */

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`h-3.5 w-3.5 ${active ? "text-accent-mid" : ""}`}
    >
      <path d="M1 3.5A2.5 2.5 0 0 1 3.5 1h1A2.5 2.5 0 0 1 7 3.5v1A2.5 2.5 0 0 1 4.5 7h-1A2.5 2.5 0 0 1 1 4.5v-1ZM1 11.5A2.5 2.5 0 0 1 3.5 9h1A2.5 2.5 0 0 1 7 11.5v1A2.5 2.5 0 0 1 4.5 15h-1A2.5 2.5 0 0 1 1 12.5v-1ZM9 3.5A2.5 2.5 0 0 1 11.5 1h1A2.5 2.5 0 0 1 15 3.5v1A2.5 2.5 0 0 1 12.5 7h-1A2.5 2.5 0 0 1 9 4.5v-1ZM9 11.5A2.5 2.5 0 0 1 11.5 9h1a2.5 2.5 0 0 1 2.5 2.5v1a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 9 12.5v-1Z" />
    </svg>
  );
}

function CheckIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`h-3.5 w-3.5 ${active ? "text-accent-mid" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function InboxIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`h-3.5 w-3.5 ${active ? "text-accent-mid" : ""}`}
    >
      <path d="M2.177 7.566a.75.75 0 0 0-.354 0C1.052 7.748.5 8.45.5 9.28v2.47A2.25 2.25 0 0 0 2.75 14h10.5a2.25 2.25 0 0 0 2.25-2.25V9.28c0-.83-.552-1.532-1.323-1.714a.75.75 0 0 0-.354 0L11.823 2.5H4.177l-2 5.066ZM4.5 9a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75h7a.75.75 0 0 0 .75-.75v-.5A.75.75 0 0 0 11.5 9h-7Z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
