"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Archive, ArchiveRestore, Trash2, Settings } from "lucide-react";
import { archiveBoard, deleteBoard } from "@/lib/actions/board";
import { hasPermission, Permission } from "@/lib/permissions";
import { TaskStatus } from "@/prisma/generated/prisma/enums";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: string;
  author: { name: string | null };
  assignees: { id: string; name: string | null }[];
  tags: { name: string; color: string | null }[];
}

interface Board {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  tasks: Task[];
  _count: { tasks: number };
}

const PRIORITY_INDICATORS: Record<string, string> = {
  URGENT: "!!!!",
  HIGH: "!!!",
  MEDIUM: "!!",
  LOW: "!",
  NONE: "",
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "#ef4444",
  HIGH: "#f0a468",
  MEDIUM: "#f1c258",
  LOW: "#6bc96b",
  NONE: "",
};

export function BoardRow({
  board,
  workspaceId,
  statusOrder,
  statusLabels,
  statusColors,
  searchQuery,
  permissions,
}: {
  board: Board;
  workspaceId: string;
  statusOrder: TaskStatus[];
  statusLabels: Record<TaskStatus, string>;
  statusColors: Record<TaskStatus, string>;
  searchQuery?: string;
  permissions: number;
}) {
  const [, archiveAction, archivePending] = useActionState(archiveBoard, null);
  const [, deleteAction, deletePending] = useActionState(deleteBoard, null);

  const canEdit = hasPermission(permissions, Permission.EDIT_CONTENT);
  const canDelete = hasPermission(permissions, Permission.DELETE_CONTENT);

  const tasksByStatus = statusOrder.map((status) => ({
    status,
    label: statusLabels[status],
    color: statusColors[status],
    tasks: board.tasks.filter((t) => t.status === status),
  }));

  return (
    <div
      className={`rounded-md border bg-bg-elevated/60 backdrop-blur-sm ${
        board.isActive
          ? "border-border"
          : "border-dashed border-border opacity-60"
      }`}
    >
      {/* Board header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <Link
            href={`/dashboard/workspaces/${workspaceId}/boards/${board.id}`}
            className="font-mono text-sm font-medium text-fg-primary transition-colors hover:text-accent"
          >
            {board.name}
          </Link>
          {!board.isActive && (
            <span className="rounded bg-bg-secondary px-1.5 py-0.5 text-[9px] text-fg-muted">
              Archived
            </span>
          )}
          <span className="text-[10px] text-fg-muted">
            {board._count.tasks} task{board._count.tasks !== 1 && "s"}
            {searchQuery && board.tasks.length !== board._count.tasks && (
              <> · {board.tasks.length} matching</>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {canEdit && (
            <Link
              href={`/dashboard/workspaces/${workspaceId}/boards/${board.id}`}
              className="rounded p-1 text-fg-muted transition-colors hover:text-fg-secondary"
              title="Board details"
            >
              <Settings size={12} />
            </Link>
          )}
          {canEdit && (
            <form action={archiveAction}>
              <input type="hidden" name="boardId" value={board.id} />
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <button
                type="submit"
                disabled={archivePending}
                className="rounded p-1 text-fg-muted transition-colors hover:text-fg-secondary disabled:opacity-50"
                title={board.isActive ? "Archive" : "Unarchive"}
              >
                {board.isActive ? (
                  <Archive size={12} />
                ) : (
                  <ArchiveRestore size={12} />
                )}
              </button>
            </form>
          )}
          {canDelete && (
            <form action={deleteAction}>
              <input type="hidden" name="boardId" value={board.id} />
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <button
                type="submit"
                disabled={deletePending}
                className="rounded p-1 text-fg-muted transition-colors hover:text-accent-emphasis disabled:opacity-50"
                title="Delete board"
                onClick={(e) => {
                  if (
                    !confirm(
                      `Delete "${board.name}"? All tasks in this board will be permanently deleted.`,
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                <Trash2 size={12} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Status columns */}
      <div className="grid gap-px lg:grid-cols-4">
        {tasksByStatus.map((column) => (
          <div key={column.status} className="p-2">
            {/* Mobile label */}
            <div className="mb-1.5 flex items-center gap-1.5 lg:hidden">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <span className="text-[10px] font-medium text-fg-muted">
                {column.label} ({column.tasks.length})
              </span>
            </div>

            {/* Scrollable task list */}
            <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
              {column.tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/dashboard/workspaces/${workspaceId}/boards/${board.id}`}
                  className="block rounded border border-border-subtle bg-bg-primary/60 p-2 transition-colors hover:border-accent/20"
                >
                  <div className="flex items-start gap-1.5">
                    {task.priority !== "NONE" && (
                      <span
                        className="shrink-0 font-mono text-[9px] font-bold"
                        style={{ color: PRIORITY_COLORS[task.priority] }}
                      >
                        {PRIORITY_INDICATORS[task.priority]}
                      </span>
                    )}
                    <p className="font-mono text-[11px] font-medium text-fg-primary line-clamp-2">
                      {task.title}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
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
                    {task.assignees.length > 0 && (
                      <span className="text-[9px] text-fg-muted">
                        {task.assignees.map((a) => a.name).join(", ")}
                      </span>
                    )}
                  </div>
                </Link>
              ))}

              {column.tasks.length === 0 && (
                <p className="py-3 text-center text-[9px] text-fg-muted">—</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
