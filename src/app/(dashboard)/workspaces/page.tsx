import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function WorkspacesPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true, boards: true } },
        },
      },
      role: true,
    },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-lg font-semibold text-fg-primary">
            Workspaces
          </h1>
          <p className="mt-1 text-xs text-fg-muted">
            Manage and access your workspaces
          </p>
        </div>
        <Link
          href="/workspaces/new"
          className="rounded-md bg-accent-mid px-3 py-1.5 text-xs font-medium text-bg-primary transition-colors hover:bg-accent-strong"
        >
          Create Workspace
        </Link>
      </div>

      {memberships.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-xs text-fg-muted">
            You&apos;re not a member of any workspaces yet.
          </p>
          <Link
            href="/workspaces/new"
            className="mt-4 inline-block rounded-md bg-accent-mid px-3 py-1.5 text-xs font-medium text-bg-primary transition-colors hover:bg-accent-strong"
          >
            Create your first workspace
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map(({ workspace, role }) => (
            <Link
              key={workspace.id}
              href={`/workspaces/${workspace.id}`}
              className="group rounded-md border border-border bg-bg-elevated/60 p-4 backdrop-blur-sm transition-colors hover:border-accent-mid/30"
            >
              <h3 className="font-mono text-sm font-medium text-fg-primary group-hover:text-accent-mid">
                {workspace.name}
              </h3>
              {workspace.description && (
                <p className="mt-1 text-xs text-fg-muted line-clamp-2">
                  {workspace.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 text-[10px] text-fg-muted">
                <span>{workspace._count.members} members</span>
                <span className="text-border">·</span>
                <span>{workspace._count.boards} boards</span>
                <span className="text-border">·</span>
                <span
                  className="rounded-full border px-1.5 py-0.5"
                  style={{
                    borderColor: role.color + "40",
                    color: role.color,
                  }}
                >
                  {role.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
