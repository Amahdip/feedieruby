import { z } from "zod";
import { ZId } from "@salamruby/types/common";
import { ZOrganizationUpdateInput } from "@salamruby/types/organizations";

export const ZOrganizationAISettingsInput = ZOrganizationUpdateInput.pick({
  isAISmartToolsEnabled: true,
});

export const ZUpdateOrganizationAISettingsAction = z.object({
  organizationId: ZId,
  data: ZOrganizationAISettingsInput,
});
