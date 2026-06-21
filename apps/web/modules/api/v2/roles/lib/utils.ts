import { OrganizationRole } from "@salamruby/database/prisma";
import { Result, err, ok } from "@salamruby/types/error-handlers";
import { IS_SALAMRUBY_CLOUD } from "@/lib/constants";
import { ApiErrorResponseV2 } from "@/modules/api/v2/types/api-error";

export const getRoles = (): Result<{ data: string[] }, ApiErrorResponseV2> => {
  try {
    const roles = Object.values(OrganizationRole);

    // Filter out the billing role if not in SalamRuby Cloud
    const filteredRoles = roles.filter((role) => !(role === "billing" && !IS_SALAMRUBY_CLOUD));
    return ok({
      data: filteredRoles,
    });
  } catch {
    return err({
      type: "internal_server_error",
      details: [{ field: "roles", issue: "Failed to get roles" }],
    });
  }
};
