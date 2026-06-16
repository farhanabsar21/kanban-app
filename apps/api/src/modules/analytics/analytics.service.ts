import { prisma } from "../../database/prisma";

export async function getMyDashboardAnalytics(userId: string) {
  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    select: {
      id: true,
      _count: {
        select: {
          boards: true,
          members: true,
        },
      },
      boards: {
        select: {
          id: true,
          tasks: {
            select: {
              id: true,
              dueDate: true,
            },
          },
        },
      },
    },
  });

  const totalWorkspaces = workspaces.length;
  const totalBoards = workspaces.reduce(
    (sum: any, workspace: { _count: { boards: any } }) =>
      sum + workspace._count.boards,
    0,
  );
  const totalMembers = workspaces.reduce(
    (sum: any, workspace: { _count: { members: any } }) =>
      sum + workspace._count.members,
    0,
  );

  const tasks = workspaces.flatMap((workspace: { boards: any[] }) =>
    workspace.boards.flatMap((board: { tasks: any }) => board.tasks),
  );

  const now = new Date();

  const overdueTasks = tasks.filter((task: { dueDate: number }) => {
    if (!task.dueDate) return false;
    return task.dueDate < now;
  }).length;

  return {
    totalWorkspaces,
    totalBoards,
    totalMembers,
    totalTasks: tasks.length,
    overdueTasks,
  };
}
