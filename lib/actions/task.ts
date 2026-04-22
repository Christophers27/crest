"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTask(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const boardId = formData.get("boardId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;

  if (!boardId || !title?.trim()) {
    return { error: "Task title is required" };
  }

  // Verify membership via the board's workspace
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
      boardId,
      authorId: session.user.id,
    },
  });

  revalidatePath(`/dashboard/workspaces/${workspaceId}/boards/${boardId}`);
  return { success: true };
}
