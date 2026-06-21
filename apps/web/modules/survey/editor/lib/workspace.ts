import { cache as reactCache } from "react";
import { prisma } from "@salamruby/database";
import { Language, Prisma, Workspace } from "@salamruby/database/prisma";
import { logger } from "@salamruby/logger";
import { DatabaseError, ResourceNotFoundError } from "@salamruby/types/errors";

export const getWorkspace = reactCache(async (workspaceId: string): Promise<Workspace | null> => {
  try {
    const workspacePrisma = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    return workspacePrisma;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(error, "Error fetching workspace");
      throw new DatabaseError(error.message);
    }
    throw error;
  }
});

export const getWorkspaceLanguages = reactCache(async (workspaceId: string): Promise<Language[]> => {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    select: {
      languages: {
        orderBy: {
          code: "asc",
        },
      },
    },
  });
  if (!workspace) {
    throw new ResourceNotFoundError("Workspace not found", workspaceId);
  }
  return workspace.languages;
});
