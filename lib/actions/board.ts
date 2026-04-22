"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createBoard(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId") as string;
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;

  if (!workspaceId || !name?.trim()) {
    return { error: "Board name is required" };
  }

  // Verify membership
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId },
    },
  });

  if (!membership) {
    return { error: "You are not a member of this workspace" };
  }

  const boardCount = await prisma.board.count({ where: { workspaceId } });

  await prisma.board.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      workspaceId,
      displayOrder: boardCount,
    },
  });

  redirect(`/dashboard/workspaces/${workspaceId}`);
}
