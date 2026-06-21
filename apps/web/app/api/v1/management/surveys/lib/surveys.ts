import "server-only";
import { cache as reactCache } from "react";
import { prisma } from "@salamruby/database";
import { Prisma } from "@salamruby/database/prisma";
import { logger } from "@salamruby/logger";
import { ZId, ZOptionalNumber } from "@salamruby/types/common";
import { DatabaseError } from "@salamruby/types/errors";
import { TSurvey } from "@salamruby/types/surveys/types";
import { selectSurvey } from "@/lib/survey/service";
import { transformPrismaSurvey } from "@/lib/survey/utils";
import { validateInputs } from "@/lib/utils/validate";

export const getSurveys = reactCache(
  async (workspaceIds: string[], limit?: number, offset?: number): Promise<TSurvey[]> => {
    validateInputs([workspaceIds, ZId.array()], [limit, ZOptionalNumber], [offset, ZOptionalNumber]);

    try {
      const surveysPrisma = await prisma.survey.findMany({
        where: {
          workspaceId: { in: workspaceIds },
        },
        select: selectSurvey,
        orderBy: {
          updatedAt: "desc",
        },
        take: limit,
        skip: offset,
      });
      return surveysPrisma.map((surveyPrisma) => transformPrismaSurvey<TSurvey>(surveyPrisma));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error(error, "Error getting surveys");
        throw new DatabaseError(error.message);
      }
      throw error;
    }
  }
);
