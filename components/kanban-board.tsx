"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useTransition } from "react";
import Link from "next/link";
import { updateTaskStatus } from "@/lib/actions/task";
import { CreateTaskForm } from "@/app/dashboard/workspaces/[workspaceId]/boards/[boardId]/create-task-form";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  author: { name: string | null };
  assignees: { id: string; name: string | null }[];
  tags: { name: string; color: string | null }[];
}

interface Column {
  status: string;
  label: string;
  color: string;
  tasks: Task[];
}

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "#ef4444",
  HIGH: "#f0a468",
  MEDIUM: "#f1c258",
  LOW: "#6bc96b",
  NONE: "",
};

export function KanbanBoard({
  columns,
  boardId,
  workspaceId,
  canCreate,
}: {
  columns: Column[];
  boardId: string;
  workspaceId: string;
  canCreate: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;

    const newStatus = result.destination.droppableId;
    const taskId = result.draggableId;

    if (result.source.droppableId === newStatus) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("taskId", taskId);
      formData.set("status", newStatus);
      formData.set("workspaceId", workspaceId);
      await updateTaskStatus(null, formData);
    });
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className={`grid gap-4 lg:grid-cols-4 ${isPending ? "opacity-70" : ""}`}
      >
        {columns.map((column) => (
          <div key={column.status}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
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
              {canCreate && (
                <CreateTaskForm
                  boardId={boardId}
                  workspaceId={workspaceId}
                  defaultStatus={column.status}
                  compact
                />
              )}
            </div>

            <Droppable droppableId={column.status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[60px] max-h-[60vh] space-y-2 overflow-y-auto rounded-md p-1 pr-1 transition-colors ${
                    snapshot.isDraggingOver
                      ? "bg-accent/5 ring-1 ring-accent/20"
                      : ""
                  }`}
                >
                  {column.tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`rounded-md border bg-bg-elevated/60 p-3 backdrop-blur-sm transition-colors ${
                            snapshot.isDragging
                              ? "border-accent/40 shadow-lg shadow-accent/10"
                              : "border-border hover:border-accent/30"
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            {task.priority !== "NONE" && (
                              <div
                                className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor:
                                    PRIORITY_COLORS[task.priority],
                                }}
                              />
                            )}
                            <Link
                              href={`/dashboard/workspaces/${workspaceId}/boards/${boardId}/tasks/${task.id}`}
                              className="font-mono text-xs font-medium text-fg-primary hover:text-accent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {task.title}
                            </Link>
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
                                    backgroundColor:
                                      (tag.color ?? "#6B7280") + "15",
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
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {column.tasks.length === 0 && !snapshot.isDraggingOver && (
                    <p className="py-4 text-center text-[10px] text-fg-muted">
                      No tasks
                    </p>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
