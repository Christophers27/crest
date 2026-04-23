"use client";

import Link from "next/link";

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "#ef4444",
  HIGH: "#f0a468",
  MEDIUM: "#f1c258",
  LOW: "#6bc96b",
  NONE: "",
};

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "#9c9c98",
  IN_PROGRESS: "#f1c258",
  IN_REVIEW: "#f0a468",
  COMPLETED: "#6bc96b",
};

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  COMPLETED: "Completed",
};

export interface TaskCardData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | null;
  points?: number | null;
  assignees: { id: string; name: string | null }[];
  tags?: { name: string; color: string | null }[];
  board?: { id: string; name: string };
  boardId?: string;
}

/**
 * Simple card: name, priority dot, description (1 line), assignees, due date.
 * Detailed card: above + tags, status badge, points.
 */
export function TaskCard({
  task,
  variant = "simple",
  workspaceId,
  href,
  className = "",
}: {
  task: TaskCardData;
  variant?: "simple" | "detailed";
  workspaceId: string;
  href?: string;
  className?: string;
}) {
  const link =
    href ??
    `/dashboard/workspaces/${workspaceId}/boards/${task.board?.id ?? task.boardId}/tasks/${task.id}`;

  return (
    <Link
      href={link}
      className={`block rounded-md border border-border bg-bg-elevated/60 p-3 backdrop-blur-sm transition-colors hover:border-accent/30 ${className}`}
    >
      {/* Row 1: priority + title */}
      <div className="flex items-start gap-1.5">
        {task.priority !== "NONE" && (
          <div
            className="mt-1 h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
          />
        )}
        <p className="font-mono text-xs font-medium text-fg-primary line-clamp-2">
          {task.title}
        </p>
      </div>

      {/* Row 2: description (1 line) */}
      {task.description && (
        <p className="mt-1 text-[11px] text-fg-muted line-clamp-1">
          {task.description}
        </p>
      )}

      {/* Row 3 (detailed only): tags + status + points */}
      {variant === "detailed" && (
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          <span
            className="rounded-full px-1.5 py-px text-[10px] font-medium"
            style={{
              backgroundColor: STATUS_COLORS[task.status] + "20",
              color: STATUS_COLORS[task.status],
            }}
          >
            {STATUS_LABELS[task.status] ?? task.status}
          </span>
          {task.points != null && (
            <span className="rounded bg-bg-secondary px-1 py-px text-[10px] font-mono text-fg-muted">
              {task.points}pt
            </span>
          )}
          {task.tags?.map((tag) => (
            <span
              key={tag.name}
              className="rounded px-1 py-px text-[9px]"
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

      {/* Row 4: assignees + due date */}
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-fg-muted">
        {task.assignees.length > 0 && (
          <span className="truncate">
            {task.assignees.map((a) => a.name).join(", ")}
          </span>
        )}
        {task.dueDate && (
          <span className="ml-auto shrink-0">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </Link>
  );
}
