import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TaskStatus } from "@/prisma/generated/prisma/enums";
import { CreateTaskForm } from "./create-task-form";

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
        },
      },
    },
  });

  if (!board || board.workspaceId !== workspaceId) notFound();

  const tasksByStatus = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    color: STATUS_COLORS[status],
    tasks: board.tasks.filter((t) => t.status === status),
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href={`/dashboard/workspaces/${workspaceId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-fg-muted transition-colors hover:text-fg-secondary"
      >
        <ArrowLeft size={12} />
        Back to workspace
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-lg font-semibold text-fg-primary">
            {board.name}
          </h1>
          {board.description && (
            <p className="mt-1 text-xs text-fg-muted">{board.description}</p>
          )}
        </div>
      </div>

      {/* Inline task creation */}
      <div className="mt-6">
        <CreateTaskForm boardId={boardId} workspaceId={workspaceId} />
      </div>

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

            <div className="space-y-2">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-md border border-border bg-bg-elevated/60 p-3 backdrop-blur-sm transition-colors hover:border-accent/30"
                >
                  <p className="font-mono text-xs font-medium text-fg-primary">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="mt-1 text-[10px] text-fg-muted line-clamp-2">
                      {task.description}
                    </p>
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
