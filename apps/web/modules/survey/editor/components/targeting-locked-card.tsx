"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { LockIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { shouldRenderEnterpriseSection } from "@/lib/brand-color";
import { UpgradePrompt } from "@/modules/ui/components/upgrade-prompt";

interface TargetingLockedCardProps {
  isSalamRubyCloud: boolean;
  workspaceId: string;
  enterpriseLicenseRequestFormUrl: string;
}

export const TargetingLockedCard = ({
  isSalamRubyCloud,
  workspaceId,
  enterpriseLicenseRequestFormUrl,
}: TargetingLockedCardProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!shouldRenderEnterpriseSection(false)) {
    return null;
  }

  const workspaceBasePath = `/workspaces/${workspaceId}`;

  return (
    <Collapsible.Root
      className="w-full overflow-hidden rounded-lg border border-slate-300 bg-white"
      onOpenChange={setOpen}
      open={open}>
      <Collapsible.CollapsibleTrigger
        asChild
        className="h-full w-full cursor-pointer rounded-lg hover:bg-slate-50">
        <div className="inline-flex px-4 py-4">
          <div className="flex items-center pl-2 pr-5">
            <div className="rounded-full border border-slate-300 bg-slate-100 p-1">
              <LockIcon className="size-4 text-slate-500" strokeWidth={3} />
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-800">{t("workspace.segments.target_audience")}</p>
            <p className="mt-1 text-sm text-slate-500">{t("workspace.segments.pre_segment_users")}</p>
          </div>
        </div>
      </Collapsible.CollapsibleTrigger>
      <Collapsible.CollapsibleContent className="min-w-full overflow-auto">
        <hr className="text-slate-600" />
        <div className="flex items-center justify-center">
          <UpgradePrompt
            title={t("workspace.surveys.edit.unlock_targeting_title")}
            description={t("workspace.surveys.edit.unlock_targeting_description")}
            feature="targeting"
            buttons={[
              {
                text: isSalamRubyCloud ? t("common.upgrade_plan") : t("common.request_trial_license"),
                href: isSalamRubyCloud
                  ? `${workspaceBasePath}/settings/organization/billing`
                  : enterpriseLicenseRequestFormUrl,
              },
              {
                text: t("common.learn_more"),
                href: isSalamRubyCloud
                  ? `${workspaceBasePath}/settings/organization/billing`
                  : "https://salamruby.com/learn-more-self-hosting-license",
              },
            ]}
          />
        </div>
      </Collapsible.CollapsibleContent>
    </Collapsible.Root>
  );
};
