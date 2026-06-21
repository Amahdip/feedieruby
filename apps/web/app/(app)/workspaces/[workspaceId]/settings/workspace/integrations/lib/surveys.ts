import "server-only";
import { cache as reactCache } from "react";
import { prisma } from "@salamruby/database";
import { Prisma } from "@salamruby/database/prisma";
import { logger } from "@salamruby/logger";
import { ZId } from "@salamruby/types/common";
import { DatabaseError } from "@salamruby/types/errors";
import { TSurvey } from "@salamruby/types/surveys/types";
import { selectSurvey } from "@/lib/survey/service";
import { transformPrismaSurvey } from "@/lib/survey/utils";
import { validateInputs } from "@/lib/utils/validate";

export const getSurveys = reactCache(async (workspaceId: string): Promise<TSurvey[]> => {
  validateInputs([workspaceId, ZId]);

  try {
    const surveysPrisma = await prisma.survey.findMany({
      where: {
        workspaceId,
        status: {
          not: "completed",
        },
      },
      select: selectSurvey,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return surveysPrisma.map((surveyPrisma) => transformPrismaSurvey<TSurvey>(surveyPrisma));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error({ error }, "getSurveys: Could not fetch surveys");
      throw new DatabaseError(error.message);
    }
    throw error;
  }
});
