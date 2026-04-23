import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, LayoutList } from "lucide-react";
import { TaskStatus } from "@/prisma/generated/prisma/enums";
import { BoardRow } from "./board-row";

const STATUS_ORDER: TaskStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
];

const STATUS_LABELS: Record<TaskStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  COMPLETED: "Completed",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  NOT_STARTED: "#9c9c98",
  IN_PROGRESS: "#f1c258",
  IN_REVIEW: "#f0a468",
  COMPLETED: "#6bc96b",
};

export default async function BoardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ showArchived?: string; q?: string }>;
}) {
  const { workspaceId } = await params;
  const { showArchived, q } = await searchParams;
  const session = await auth();
  const userId = session!.user!.id!;

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    include: { role: true },
  });

  if (!membership) notFound();

  const includeArchived = showArchived === "true";

  const boards = await prisma.board.findMany({
    where: {
      workspaceId,
      ...(includeArchived ? {} : { isActive: true }),
    },
    orderBy: { displayOrder: "asc" },
    include: {
      tasks: {
        where: q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { name: true } },
          assignees: { select: { id: true, name: true } },
          tags: { select: { name: true, color: true } },
        },
      },
      _count: { select: { tasks: true } },
    },
  });

  const archivedCount = await prisma.board.count({
    where: { workspaceId, isActive: false },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href={`/dashboard/workspaces/${workspaceId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-fg-muted transition-colors hover:text-fg-secondary"
      >
        <ArrowLeft size={12} />
        Back to workspace
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <LayoutList size={16} className="text-accent" />
          <h1 className="font-mono text-lg font-semibold text-fg-primary">
            Boards
          </h1>
        </div>
        <Link
          href={`/dashboard/workspaces/${workspaceId}/boards/new`}
          className="flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1.5 text-[11px] font-medium text-accent transition-colors hover:bg-accent/20"
        >
          <Plus size={11} />
          New Board
        </Link>
      </div>

      {/* Search + filters */}
      <div className="mt-4 flex items-center gap-3">
        <form className="flex-1">
          <input
            name="q"
            type="text"
            defaultValue={q ?? ""}
            placeholder="Search tasks across all boards..."
            className="w-full rounded-md border border-border bg-bg-primary px-3 py-1.5 font-mono text-xs text-fg-primary placeholder-fg-muted transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
          {showArchived === "true" && (
            <input type="hidden" name="showArchived" value="true" />
          )}
        </form>
        {archivedCount > 0 && (
          <Link
            href={`/dashboard/workspaces/${workspaceId}/boards${
              includeArchived ? "" : "?showArchived=true"
            }${q ? `${includeArchived ? "?" : "&"}q=${q}` : ""}`}
            className="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-[11px] text-fg-muted transition-colors hover:text-fg-secondary"
          >
            {includeArchived
              ? "Hide archived"
              : `Show archived (${archivedCount})`}
          </Link>
        )}
      </div>

      {/* Status column headers */}
      <div className="mt-6">
        <div className="mb-2 hidden items-center gap-1 lg:flex">
          <div className="w-48 shrink-0" />
          {STATUS_ORDER.map((status) => (
            <div key={status} className="flex-1 px-1">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                <span className="text-[10px] font-medium text-fg-muted">
                  {STATUS_LABELS[status]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Board rows */}
        {boards.length === 0 ? (
          <p className="mt-8 text-center text-xs text-fg-muted">
            {q ? "No tasks match your search." : "No boards yet."}
          </p>
        ) : (
          <div className="space-y-3">
            {boards.map((board) => (
              <BoardRow
                key={board.id}
                board={board}
                workspaceId={workspaceId}
                statusOrder={STATUS_ORDER}
                statusLabels={STATUS_LABELS}
                statusColors={STATUS_COLORS}
                searchQuery={q}
                permissions={membership.role.permissions}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
