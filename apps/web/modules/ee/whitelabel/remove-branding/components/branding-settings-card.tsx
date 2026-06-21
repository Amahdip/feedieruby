import { TWorkspace } from "@salamruby/types/workspace";
import { SettingsCard } from "@/app/(app)/workspaces/[workspaceId]/settings/components/SettingsCard";
import { shouldRenderEnterpriseSection } from "@/lib/brand-color";
import { ENTERPRISE_LICENSE_REQUEST_FORM_URL, IS_SALAMRUBY_CLOUD } from "@/lib/constants";
import { getTranslate } from "@/lingodotdev/server";
import { EditBranding } from "@/modules/ee/whitelabel/remove-branding/components/edit-branding";
import { Alert, AlertDescription } from "@/modules/ui/components/alert";
import { ModalButton, UpgradePrompt } from "@/modules/ui/components/upgrade-prompt";

interface BrandingSettingsCardProps {
  canRemoveBranding: boolean;
  workspace: TWorkspace;
  isReadOnly: boolean;
}

export const BrandingSettingsCard = async ({
  canRemoveBranding,
  workspace,
  isReadOnly,
}: BrandingSettingsCardProps) => {
  const t = await getTranslate();

  if (!shouldRenderEnterpriseSection(canRemoveBranding)) {
    return null;
  }

  const workspaceBasePath = `/workspaces/${workspace.id}`;

  const buttons: [ModalButton, ModalButton] = [
    {
      text: IS_SALAMRUBY_CLOUD ? t("common.upgrade_plan") : t("common.request_trial_license"),
      href: IS_SALAMRUBY_CLOUD
        ? `${workspaceBasePath}/settings/organization/billing`
        : ENTERPRISE_LICENSE_REQUEST_FORM_URL,
    },
    {
      text: t("common.learn_more"),
      href: "https://salamruby.com/docs/self-hosting/advanced/enterprise-features/hide-powered-by-salamruby",
    },
  ];

  return (
    <SettingsCard
      title={t("workspace.look.salamruby_branding")}
      description={t("workspace.look.salamruby_branding_settings_description")}>
      {canRemoveBranding ? (
        <div className="space-y-4">
          <EditBranding
            type="linkSurvey"
            isEnabled={workspace.linkSurveyBranding}
            workspaceId={workspace.id}
            isReadOnly={isReadOnly}
          />
          <EditBranding
            type="appSurvey"
            isEnabled={workspace.inAppSurveyBranding}
            workspaceId={workspace.id}
            isReadOnly={isReadOnly}
          />
        </div>
      ) : (
        <UpgradePrompt
          title={t("workspace.look.remove_branding_with_a_higher_plan")}
          description={t("workspace.settings.general.eliminate_branding_with_whitelabel")}
          buttons={buttons}
          feature="remove_branding"
        />
      )}
      {isReadOnly && (
        <Alert variant="warning" className="mt-4">
          <AlertDescription>
            {t("common.only_owners_managers_and_manage_access_members_can_perform_this_action")}
          </AlertDescription>
        </Alert>
      )}
    </SettingsCard>
  );
};
