"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createSprint(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId") as string;
  const title = formData.get("title") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;

  if (!workspaceId || !title?.trim()) {
    return { error: "Sprint title is required" };
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId },
    },
  });

  if (!membership) {
    return { error: "You are not a member of this workspace" };
  }

  await prisma.sprint.create({
    data: {
      title: title.trim(),
      workspaceId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  redirect(`/dashboard/workspaces/${workspaceId}`);
}
