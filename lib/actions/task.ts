"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TaskStatus } from "@/prisma/generated/prisma/enums";

const VALID_STATUSES: TaskStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
];

export async function createTask(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const boardId = formData.get("boardId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const status = (formData.get("status") as TaskStatus) || "NOT_STARTED";

  if (!boardId || !title?.trim()) {
    return { error: "Task title is required" };
  }

  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { workspaceId: true },
  });

  if (!board) return { error: "Board not found" };

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: board.workspaceId,
      },
    },
  });

  if (!membership) {
    return { error: "You are not a member of this workspace" };
  }

  await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      status,
      boardId,
      authorId: session.user.id,
    },
  });

  revalidatePath(`/dashboard/workspaces/${workspaceId}/boards/${boardId}`);
  revalidatePath(`/dashboard/workspaces/${workspaceId}/boards`);
  return { success: true };
}

export async function updateTaskStatus(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const taskId = formData.get("taskId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  const status = formData.get("status") as TaskStatus;

  if (!taskId || !status || !VALID_STATUSES.includes(status)) {
    return { error: "Invalid request" };
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { board: { select: { workspaceId: true, id: true } } },
  });

  if (!task) return { error: "Task not found" };

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: task.board.workspaceId,
      },
    },
  });

  if (!membership) return { error: "Not a member" };

  await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });

  revalidatePath(`/dashboard/workspaces/${workspaceId}/boards/${task.board.id}`);
  revalidatePath(`/dashboard/workspaces/${workspaceId}/boards`);
  return { success: true };
}
