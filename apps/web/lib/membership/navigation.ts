export const getBillingFallbackPath = (workspaceId: string, isSalamRubyCloud: boolean): string => {
  const settingsPath = isSalamRubyCloud ? "billing" : "enterprise";
  return `/workspaces/${workspaceId}/settings/organization/${settingsPath}`;
};
