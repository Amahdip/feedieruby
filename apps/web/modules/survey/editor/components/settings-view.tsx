import { type Dispatch, type SetStateAction } from "react";
import { ActionClass, OrganizationRole } from "@salamruby/database/prisma-browser";
import { TContactAttributeKey } from "@salamruby/types/contact-attribute-key";
import { TSurveyQuota } from "@salamruby/types/quota";
import { TSegment } from "@salamruby/types/segment";
import { TSurvey } from "@salamruby/types/surveys/types";
import { TUserLocale } from "@salamruby/types/user";
import { HIDE_QUOTAS_FEATURE } from "@/lib/brand-color";
import { TargetingCard } from "@/modules/ee/contacts/segments/components/targeting-card";
import { QuotasCard } from "@/modules/ee/quotas/components/quotas-card";
import { TTeamPermission } from "@/modules/ee/teams/workspace-teams/types/team";
import { HowToSendCard } from "@/modules/survey/editor/components/how-to-send-card";
import { RecontactOptionsCard } from "@/modules/survey/editor/components/recontact-options-card";
import { ResponseOptionsCard } from "@/modules/survey/editor/components/response-options-card";
import { SurveyPlacementCard } from "@/modules/survey/editor/components/survey-placement-card";
import { TargetingLockedCard } from "@/modules/survey/editor/components/targeting-locked-card";
import { WhenToSendCard } from "@/modules/survey/editor/components/when-to-send-card";

interface SettingsViewProps {
  localSurvey: TSurvey;
  setLocalSurvey: Dispatch<SetStateAction<TSurvey>>;
  actionClasses: ActionClass[];
  contactAttributeKeys: TContactAttributeKey[];
  segments: TSegment[];
  responseCount: number;
  membershipRole?: OrganizationRole;
  isUserTargetingAllowed?: boolean;
  isSpamProtectionAllowed: boolean;
  workspacePermission: TTeamPermission | null;
  isSalamRubyCloud: boolean;
  isQuotasAllowed: boolean;
  quotas: TSurveyQuota[];
  locale: TUserLocale;
  appSetupCompleted: boolean;
  enterpriseLicenseRequestFormUrl: string;
}

export const SettingsView = ({
  localSurvey,
  setLocalSurvey,
  actionClasses,
  contactAttributeKeys,
  segments,
  responseCount,
  membershipRole,
  isUserTargetingAllowed = false,
  isSpamProtectionAllowed,
  isQuotasAllowed,
  workspacePermission,
  isSalamRubyCloud,
  quotas,
  locale,
  appSetupCompleted,
  enterpriseLicenseRequestFormUrl,
}: SettingsViewProps) => {
  const isAppSurvey = localSurvey.type === "app";

  return (
    <div className="mt-12 space-y-3 p-5">
      <HowToSendCard
        localSurvey={localSurvey}
        setLocalSurvey={setLocalSurvey}
        appSetupCompleted={appSetupCompleted}
      />

      {localSurvey.type === "app" ? (
        <div>
          {isUserTargetingAllowed ? (
            <div className="relative">
              <div className="blur-none">
                <TargetingCard
                  key={localSurvey.segment?.id}
                  localSurvey={localSurvey}
                  setLocalSurvey={setLocalSurvey}
                  contactAttributeKeys={contactAttributeKeys}
                  segments={segments}
                  initialSegment={segments.find((segment) => segment.id === localSurvey.segment?.id)}
                />
              </div>
            </div>
          ) : (
            <TargetingLockedCard
              isSalamRubyCloud={isSalamRubyCloud}
              workspaceId={localSurvey.workspaceId}
              enterpriseLicenseRequestFormUrl={enterpriseLicenseRequestFormUrl}
            />
          )}
        </div>
      ) : null}

      <WhenToSendCard
        localSurvey={localSurvey}
        setLocalSurvey={setLocalSurvey}
        workspaceId={localSurvey.workspaceId}
        propActionClasses={actionClasses}
        membershipRole={membershipRole}
        workspacePermission={workspacePermission}
      />
      {isQuotasAllowed && !HIDE_QUOTAS_FEATURE && (
        <QuotasCard
          localSurvey={localSurvey}
          isQuotasAllowed={isQuotasAllowed}
          isSalamRubyCloud={isSalamRubyCloud}
          quotas={quotas}
          hasResponses={responseCount > 0}
          enterpriseLicenseRequestFormUrl={enterpriseLicenseRequestFormUrl}
        />
      )}

      <ResponseOptionsCard
        localSurvey={localSurvey}
        setLocalSurvey={setLocalSurvey}
        responseCount={responseCount}
        isSpamProtectionAllowed={isSpamProtectionAllowed}
        locale={locale}
      />

      <RecontactOptionsCard localSurvey={localSurvey} setLocalSurvey={setLocalSurvey} />

      {isAppSurvey && <SurveyPlacementCard localSurvey={localSurvey} setLocalSurvey={setLocalSurvey} />}
    </div>
  );
};
