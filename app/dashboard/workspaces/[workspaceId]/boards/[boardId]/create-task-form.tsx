"use client";

import { useActionState } from "react";
import { useState } from "react";
import { createTask } from "@/lib/actions/task";
import { Plus, X } from "lucide-react";

export function CreateTaskForm({
  boardId,
  workspaceId,
}: {
  boardId: string;
  workspaceId: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      const result = await createTask(prev, formData);
      if (result?.success) setOpen(false);
      return result;
    },
    null,
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-xs text-fg-muted transition-colors hover:border-accent/40 hover:text-accent"
      >
        <Plus size={12} />
        Add Task
      </button>
    );
  }

  return (
    <form
      action={action}
      className="rounded-md border border-border bg-bg-elevated/60 p-4 backdrop-blur-sm"
    >
      <input type="hidden" name="boardId" value={boardId} />
      <input type="hidden" name="workspaceId" value={workspaceId} />

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-fg-secondary">New Task</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-fg-muted hover:text-fg-secondary"
        >
          <X size={14} />
        </button>
      </div>

      {state?.error && (
        <div className="mb-3 rounded-md border border-accent-emphasis/30 bg-accent-emphasis/10 px-3 py-2 text-xs text-accent-emphasis">
          {state.error}
        </div>
      )}

      <div className="space-y-3">
        <input
          name="title"
          type="text"
          required
          className="block w-full rounded-md border border-border bg-bg-primary px-3 py-2 font-mono text-sm text-fg-primary placeholder-fg-muted transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
          placeholder="Task title"
          autoFocus
        />

        <textarea
          name="description"
          rows={2}
          className="block w-full resize-none rounded-md border border-border bg-bg-primary px-3 py-2 font-mono text-sm text-fg-primary placeholder-fg-muted transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
          placeholder="Description (optional)"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-1.5 text-xs text-fg-muted transition-colors hover:text-fg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-bg-primary transition-all hover:bg-accent-emphasis disabled:opacity-50"
          >
            {pending ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </form>
  );
}
