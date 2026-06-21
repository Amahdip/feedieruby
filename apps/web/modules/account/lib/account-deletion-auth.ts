import "server-only";
import type { User } from "@salamruby/database/prisma";

type TAccountDeletionPasswordAuthData = Pick<User, "identityProvider">;

export const requiresPasswordConfirmationForAccountDeletion = ({
  identityProvider,
}: TAccountDeletionPasswordAuthData): boolean => identityProvider === "email";
