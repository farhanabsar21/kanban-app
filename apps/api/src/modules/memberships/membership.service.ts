import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/app-error";
import {
  AddWorkspaceMemberInput,
  UpdateWorkspaceMemberRoleInput,
} from "./membership.schema";

async function getCurrentMembership(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new AppError("Workspace not found", 404);
  }

  return membership;
}

function ensureCanManageMembers(role: string) {
  if (role !== "OWNER" && role !== "ADMIN") {
    throw new AppError("Forbidden", 403);
  }
}

function ensureOwner(role: string) {
  if (role !== "OWNER") {
    throw new AppError("Only workspace owners can perform this action", 403);
  }
}

export async function getWorkspaceMembers(userId: string, workspaceId: string) {
  await getCurrentMembership(userId, workspaceId);

  return prisma.workspaceMember.findMany({
    where: { workspaceId },
    orderBy: { joinedAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}

export async function addWorkspaceMember(
  userId: string,
  workspaceId: string,
  input: AddWorkspaceMemberInput,
) {
  const currentMembership = await getCurrentMembership(userId, workspaceId);
  ensureCanManageMembers(currentMembership.role);

  const userToAdd = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  if (!userToAdd) {
    throw new AppError("User with this email does not exist", 404);
  }

  const existingMembership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: userToAdd.id,
      },
    },
  });

  if (existingMembership) {
    throw new AppError("User is already a workspace member", 409);
  }

  return prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: userToAdd.id,
      role: input.role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}

export async function updateWorkspaceMemberRole(
  userId: string,
  workspaceId: string,
  memberId: string,
  input: UpdateWorkspaceMemberRoleInput,
) {
  const currentMembership = await getCurrentMembership(userId, workspaceId);
  ensureOwner(currentMembership.role);

  const targetMembership = await prisma.workspaceMember.findFirst({
    where: {
      id: memberId,
      workspaceId,
    },
  });

  if (!targetMembership) {
    throw new AppError("Member not found", 404);
  }

  if (targetMembership.role === "OWNER") {
    throw new AppError("Cannot change owner role", 400);
  }

  return prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role: input.role },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}

export async function removeWorkspaceMember(
  userId: string,
  workspaceId: string,
  memberId: string,
) {
  const currentMembership = await getCurrentMembership(userId, workspaceId);
  ensureCanManageMembers(currentMembership.role);

  const targetMembership = await prisma.workspaceMember.findFirst({
    where: {
      id: memberId,
      workspaceId,
    },
  });

  if (!targetMembership) {
    throw new AppError("Member not found", 404);
  }

  if (targetMembership.role === "OWNER") {
    throw new AppError("Cannot remove workspace owner", 400);
  }

  if (currentMembership.role === "ADMIN" && targetMembership.role === "ADMIN") {
    throw new AppError("Admins cannot remove other admins", 403);
  }

  await prisma.workspaceMember.delete({
    where: { id: memberId },
  });

  return { success: true };
}
