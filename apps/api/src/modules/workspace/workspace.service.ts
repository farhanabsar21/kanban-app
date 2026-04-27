import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/app-error";
import { slugify } from "../../common/utils/slugify";
import { CreateWorkspaceInput } from "./workspace.schema";

async function createUniqueSlug(name: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingWorkspace) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function createWorkspace(
  userId: string,
  input: CreateWorkspaceInput,
) {
  const slug = await createUniqueSlug(input.name);

  return prisma.workspace.create({
    data: {
      name: input.name,
      slug,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
    include: {
      members: {
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
      },
    },
  });
}

export async function getMyWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        where: {
          userId,
        },
        select: {
          role: true,
          joinedAt: true,
        },
      },
      _count: {
        select: {
          boards: true,
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getWorkspaceById(userId: string, workspaceId: string) {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
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
        orderBy: {
          joinedAt: "asc",
        },
      },
      boards: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  return workspace;
}
