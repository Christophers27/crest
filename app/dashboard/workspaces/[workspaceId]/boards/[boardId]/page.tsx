import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { TaskStatus } from "@/prisma/generated/prisma/enums";
import { hasPermission, Permission } from "@/lib/permissions";
import { CreateTaskForm } from "./create-task-form";
import { BoardActions } from "./board-actions";

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

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "#ef4444",
  HIGH: "#f0a468",
  MEDIUM: "#f1c258",
  LOW: "#6bc96b",
  NONE: "",
};

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string; boardId: string }>;
}) {
  const { workspaceId, boardId } = await params;
  const session = await auth();
  const userId = session!.user!.id!;

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    include: { role: true },
  });

  if (!membership) notFound();

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      tasks: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { name: true } },
          assignees: { select: { id: true, name: true } },
          tags: { select: { name: true, color: true } },
        },
      },
    },
  });

  if (!board || board.workspaceId !== workspaceId) notFound();

  const canCreate = hasPermission(
    membership.role.permissions,
    Permission.CREATE_CONTENT,
  );

  const tasksByStatus = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    color: STATUS_COLORS[status],
    tasks: board.tasks.filter((t) => t.status === status),
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href={`/dashboard/workspaces/${workspaceId}/boards`}
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-fg-muted transition-colors hover:text-fg-secondary"
      >
        <ArrowLeft size={12} />
        All boards
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-semibold text-fg-primary">
              {board.name}
            </h1>
            {!board.isActive && (
              <span className="rounded bg-bg-secondary px-1.5 py-0.5 text-[9px] text-fg-muted">
                Archived
              </span>
            )}
          </div>
          {board.description && (
            <p className="mt-1 text-xs text-fg-muted">{board.description}</p>
          )}
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-fg-muted">
            <Calendar size={10} />
            Created {board.createdAt.toLocaleDateString()}
            <span className="text-border">·</span>
            {board.tasks.length} task{board.tasks.length !== 1 && "s"}
          </div>
        </div>
        <BoardActions
          board={{
            id: board.id,
            name: board.name,
            description: board.description,
            isActive: board.isActive,
          }}
          workspaceId={workspaceId}
          permissions={membership.role.permissions}
        />
      </div>

      {/* Inline task creation */}
      {canCreate && (
        <div className="mt-6">
          <CreateTaskForm boardId={boardId} workspaceId={workspaceId} />
        </div>
      )}

      {/* Kanban columns */}
      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {tasksByStatus.map((column) => (
          <div key={column.status}>
            <div className="mb-3 flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <h3 className="text-xs font-medium text-fg-secondary">
                {column.label}
              </h3>
              <span className="text-[10px] text-fg-muted">
                {column.tasks.length}
              </span>
            </div>

            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-md border border-border bg-bg-elevated/60 p-3 backdrop-blur-sm transition-colors hover:border-accent/30"
                >
                  <div className="flex items-start gap-1.5">
                    {task.priority !== "NONE" && (
                      <div
                        className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: PRIORITY_COLORS[task.priority],
                        }}
                      />
                    )}
                    <p className="font-mono text-xs font-medium text-fg-primary">
                      {task.title}
                    </p>
                  </div>
                  {task.description && (
                    <p className="mt-1 text-[10px] text-fg-muted line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  {task.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {task.tags.map((tag) => (
                        <span
                          key={tag.name}
                          className="rounded px-1 py-px text-[8px]"
                          style={{
                            backgroundColor: (tag.color ?? "#6B7280") + "15",
                            color: tag.color ?? "#6B7280",
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-fg-muted">
                    <span>{task.author.name}</span>
                    {task.assignees.length > 0 && (
                      <>
                        <span className="text-border">→</span>
                        <span>
                          {task.assignees.map((a) => a.name).join(", ")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {column.tasks.length === 0 && (
                <p className="py-4 text-center text-[10px] text-fg-muted">
                  No tasks
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
