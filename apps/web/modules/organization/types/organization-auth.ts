import { z } from "zod";
import { ZMembership } from "@salamruby/types/memberships";
import { ZOrganization } from "@salamruby/types/organizations";
import { ZUser } from "@salamruby/types/user";

export const ZOrganizationAuth = z.object({
  organization: ZOrganization,
  session: z.object({
    user: ZUser.pick({ id: true }),
    expires: z.string(),
  }),
  currentUserMembership: ZMembership,
  isMember: z.boolean(),
  isOwner: z.boolean(),
  isManager: z.boolean(),
  isBilling: z.boolean(),
});

export type TOrganizationAuth = z.infer<typeof ZOrganizationAuth>;
