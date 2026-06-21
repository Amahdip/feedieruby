import { cache as reactCache } from "react";
import { prisma } from "@salamruby/database";
import { Prisma } from "@salamruby/database/prisma";
import { DatabaseError } from "@salamruby/types/errors";

export const getResponseCountBySurveyId = reactCache(async (surveyId: string): Promise<number> => {
  try {
    const responseCount = await prisma.response.count({
      where: {
        surveyId,
      },
    });
    return responseCount;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
});
