import "server-only";
import { cache as reactCache } from "react";
import { prisma } from "@salamruby/database";
import { Prisma } from "@salamruby/database/prisma";
import { DatabaseError } from "@salamruby/types/errors";

export interface PublishedLinkSurvey {
  id: string;
  name: string;
}

export const getPublishedLinkSurveys = reactCache(
  async (workspaceId: string): Promise<PublishedLinkSurvey[]> => {
    try {
      const surveys = await prisma.survey.findMany({
        where: { workspaceId, status: "inProgress", type: "link" },
        select: {
          id: true,
          name: true,
        },
      });

      return surveys;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DatabaseError(error.message);
      }

      throw error;
    }
  }
);
