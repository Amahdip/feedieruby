import "server-only";
import { cache as reactCache } from "react";
import { prisma } from "@salamruby/database";
import { Prisma } from "@salamruby/database/prisma";
import { PrismaErrorType } from "@salamruby/database/types/error";
import { ZId, ZOptionalNumber, ZString } from "@salamruby/types/common";
import { Result, err, ok } from "@salamruby/types/error-handlers";
import { TTag } from "@salamruby/types/tags";
import { TagError } from "../../modules/workspaces/settings/types/tag";
import { ITEMS_PER_PAGE } from "../constants";
import { validateInputs } from "../utils/validate";

export const getTagsByWorkspaceId = reactCache(
  async (workspaceId: string, page?: number): Promise<TTag[]> => {
    validateInputs([workspaceId, ZId], [page, ZOptionalNumber]);

    try {
      const tags = await prisma.tag.findMany({
        where: {
          workspaceId,
        },
        take: page ? ITEMS_PER_PAGE : undefined,
        skip: page ? ITEMS_PER_PAGE * (page - 1) : undefined,
      });

      return tags;
    } catch (error) {
      throw error;
    }
  }
);

export const getTag = reactCache(async (id: string): Promise<TTag | null> => {
  validateInputs([id, ZId]);

  try {
    const tag = await prisma.tag.findUnique({
      where: {
        id,
      },
    });

    return tag;
  } catch (error) {
    throw error;
  }
});

export const createTag = async (
  workspaceId: string,
  name: string
): Promise<Result<TTag, { code: TagError; message: string; meta?: Record<string, string> }>> => {
  validateInputs([workspaceId, ZId], [name, ZString]);

  try {
    const tag = await prisma.tag.create({
      data: {
        name,
        workspaceId,
      },
    });

    return ok(tag);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === PrismaErrorType.UniqueConstraintViolation) {
        return err({
          code: TagError.TAG_NAME_ALREADY_EXISTS,
          message: "Tag with this name already exists",
        });
      }
    }
    return err({
      code: TagError.UNEXPECTED_ERROR,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
