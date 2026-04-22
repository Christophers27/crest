import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, LayoutList, Timer } from "lucide-react";

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const session = await auth();
  const userId = session!.user!.id!;

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    include: {
      workspace: {
        include: {
          boards: {
            orderBy: { displayOrder: "asc" },
            include: { _count: { select: { tasks: true } } },
          },
          sprints: {
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { tasks: true } } },
          },
          _count: { select: { members: true } },
        },
      },
    },
  });

  if (!membership) notFound();

  const { workspace } = membership;

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="font-mono text-lg font-semibold text-fg-primary">
          {workspace.name}
        </h1>
        {workspace.description && (
          <p className="mt-1 text-xs text-fg-muted">{workspace.description}</p>
        )}
        <p className="mt-1 text-[10px] text-fg-muted">
          {workspace._count.members} member
          {workspace._count.members !== 1 && "s"}
        </p>
      </div>

      {/* Boards */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-mono text-sm font-medium text-fg-primary">
            <LayoutList size={14} className="text-accent" />
            Boards
          </h2>
          <Link
            href={`/dashboard/workspaces/${workspaceId}/boards/new`}
            className="flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent transition-colors hover:bg-accent/20"
          >
            <Plus size={11} />
            New Board
          </Link>
        </div>

        {workspace.boards.length === 0 ? (
          <p className="mt-4 text-xs text-fg-muted">
            No boards yet. Create one to start organizing tasks.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workspace.boards.map((board) => (
              <Link
                key={board.id}
                href={`/dashboard/workspaces/${workspaceId}/boards/${board.id}`}
                className="group rounded-md border border-border bg-bg-elevated/60 p-4 backdrop-blur-sm transition-all hover:border-accent/40"
              >
                <h3 className="font-mono text-sm font-medium text-fg-primary transition-colors group-hover:text-accent">
                  {board.name}
                </h3>
                {board.description && (
                  <p className="mt-1 text-xs text-fg-muted line-clamp-2">
                    {board.description}
                  </p>
                )}
                <p className="mt-2 text-[10px] text-fg-muted">
                  {board._count.tasks} task{board._count.tasks !== 1 && "s"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Sprints */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-mono text-sm font-medium text-fg-primary">
            <Timer size={14} className="text-accent" />
            Sprints
          </h2>
          <Link
            href={`/dashboard/workspaces/${workspaceId}/sprints/new`}
            className="flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent transition-colors hover:bg-accent/20"
          >
            <Plus size={11} />
            New Sprint
          </Link>
        </div>

        {workspace.sprints.length === 0 ? (
          <p className="mt-4 text-xs text-fg-muted">
            No sprints yet. Create one to organize tasks into time-based cycles.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {workspace.sprints.map((sprint) => (
              <div
                key={sprint.id}
                className="flex items-center justify-between rounded-md border border-border bg-bg-elevated/60 px-4 py-3 backdrop-blur-sm"
              >
                <div>
                  <p className="font-mono text-sm font-medium text-fg-primary">
                    {sprint.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-fg-muted">
                    {sprint._count.tasks} task{sprint._count.tasks !== 1 && "s"}
                    {sprint.startDate && sprint.endDate && (
                      <>
                        {" · "}
                        {new Date(sprint.startDate).toLocaleDateString()} –{" "}
                        {new Date(sprint.endDate).toLocaleDateString()}
                      </>
                    )}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    sprint.isActive
                      ? "bg-accent/10 text-accent"
                      : "bg-bg-secondary text-fg-muted"
                  }`}
                >
                  {sprint.isActive ? "Active" : "Closed"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
