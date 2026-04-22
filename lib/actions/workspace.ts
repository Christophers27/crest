"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createWorkspace(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;

  if (!name || name.trim().length === 0) {
    return { error: "Workspace name is required" };
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      createdById: session.user.id,
      roles: {
        create: {
          name: "Owner",
          color: "#f0a468",
          permissions: 0x7fffffff,
        },
      },
    },
    include: { roles: true },
  });

  const ownerRole = workspace.roles[0];

  await prisma.workspaceMember.create({
    data: {
      userId: session.user.id,
      workspaceId: workspace.id,
      roleId: ownerRole.id,
    },
  });

  redirect(`/dashboard/workspaces/${workspace.id}`);
}
