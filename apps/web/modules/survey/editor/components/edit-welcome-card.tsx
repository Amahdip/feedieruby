"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { Hand } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TI18nString } from "@salamruby/types/i18n";
import {
  TSurvey,
  TSurveyEndScreenCard,
  TSurveyRedirectUrlCard,
  TSurveyWelcomeCard,
} from "@salamruby/types/surveys/types";
import { TUserLocale } from "@salamruby/types/user";
import { getDefaultWelcomeCard } from "@/app/lib/survey-builder";
import { cn } from "@/lib/cn";
import { getLanguageCode } from "@/lib/i18n/utils";
import { ElementFormInput } from "@/modules/survey/components/element-form-input";
import { FileInput } from "@/modules/ui/components/file-input";
import { Label } from "@/modules/ui/components/label";
import { Switch } from "@/modules/ui/components/switch";

interface EditWelcomeCardProps {
  localSurvey: TSurvey;
  setLocalSurvey: (survey: TSurvey) => void;
  setActiveElementId: (id: string | null) => void;
  activeElementId: string | null;
  isInvalid: boolean;
  locale: TUserLocale;
  isStorageConfigured: boolean;
  isExternalUrlsAllowed?: boolean;
}

export const EditWelcomeCard = ({
  localSurvey,
  setLocalSurvey,
  setActiveElementId,
  activeElementId,
  isInvalid,
  locale,
  isStorageConfigured = true,
  isExternalUrlsAllowed,
}: EditWelcomeCardProps) => {
  const { t } = useTranslation();

  const path = usePathname();
  // Parse workspace ID from path to build the base path for file uploads
  const workspaceId =
    path?.split("/environments/")[1]?.split("/")[0] ?? path?.split("/workspaces/")[1]?.split("/")[0];

  let open = activeElementId == "start";

  const setOpen = (e: boolean) => {
    if (e) {
      setActiveElementId("start");
    } else {
      setActiveElementId(null);
    }
  };

  const updateSurvey = (
    data: Partial<TSurveyEndScreenCard> | Partial<TSurveyRedirectUrlCard> | Partial<TSurveyWelcomeCard>
  ) => {
    setLocalSurvey({
      ...localSurvey,
      welcomeCard: {
        ...localSurvey.welcomeCard,
        ...data,
      },
    });
  };

  const isI18nFieldEmpty = (field?: TI18nString): boolean => {
    if (!field) {
      return true;
    }

    return !Object.values(field).some((entry) => typeof entry === "string" && entry.trim() !== "");
  };

  const welcomeTextKey = getLanguageCode(localSurvey.languages ?? [], locale);

  const stripHtmlTags = (value: string): string =>
    value
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

  const legacyWelcomeSubheaderMarkers = ["از ارائه بازخوردتان متشکریم", "Thanks for providing your feedback"];

  const isLegacyWelcomeSubheaderValue = (value: string): boolean => {
    const plain = stripHtmlTags(value);
    return legacyWelcomeSubheaderMarkers.some((marker) => plain.includes(marker));
  };

  const isLegacyWelcomeSubheader = (field?: TI18nString): boolean => {
    if (!field) {
      return false;
    }

    return Object.values(field).some(
      (entry) => typeof entry === "string" && isLegacyWelcomeSubheaderValue(entry)
    );
  };

  const needsWelcomeSubheaderDefault = (field?: TI18nString): boolean =>
    isI18nFieldEmpty(field) || isLegacyWelcomeSubheader(field);

  const migrateWelcomeSubheader = (field: TI18nString | undefined, newText: string): TI18nString => {
    const next: TI18nString = { ...(field ?? {}) };

    for (const [key, value] of Object.entries(next)) {
      if (typeof value === "string" && isLegacyWelcomeSubheaderValue(value)) {
        next[key] = newText;
      }
    }

    next[welcomeTextKey] = newText;
    return next;
  };

  const handleWelcomeToggle = (newEnabledState: boolean) => {
    if (!newEnabledState) {
      updateSurvey({ enabled: false });
      return;
    }

    const defaults = getDefaultWelcomeCard(t, welcomeTextKey);
    const defaultSubheaderText = defaults.subheader?.[welcomeTextKey] ?? "";

    updateSurvey({
      enabled: true,
      ...(isI18nFieldEmpty(localSurvey.welcomeCard.headline) && { headline: defaults.headline }),
      ...(needsWelcomeSubheaderDefault(localSurvey.welcomeCard.subheader) && {
        subheader: migrateWelcomeSubheader(localSurvey.welcomeCard.subheader, defaultSubheaderText),
      }),
      ...(isI18nFieldEmpty(localSurvey.welcomeCard.buttonLabel) && { buttonLabel: defaults.buttonLabel }),
    });
  };

  useEffect(() => {
    if (!localSurvey.welcomeCard.enabled) {
      return;
    }

    const defaults = getDefaultWelcomeCard(t, welcomeTextKey);
    const defaultSubheaderText = defaults.subheader?.[welcomeTextKey] ?? "";
    const patches: Partial<TSurveyWelcomeCard> = {};

    if (isI18nFieldEmpty(localSurvey.welcomeCard.headline)) {
      patches.headline = defaults.headline;
    }
    if (needsWelcomeSubheaderDefault(localSurvey.welcomeCard.subheader)) {
      patches.subheader = migrateWelcomeSubheader(localSurvey.welcomeCard.subheader, defaultSubheaderText);
    }
    if (isI18nFieldEmpty(localSurvey.welcomeCard.buttonLabel)) {
      patches.buttonLabel = defaults.buttonLabel;
    }

    if (Object.keys(patches).length === 0) {
      return;
    }

    updateSurvey(patches);
  }, [localSurvey.welcomeCard.enabled, localSurvey.welcomeCard.subheader, locale, t, welcomeTextKey]);

  return (
    <div className={cn(open ? "shadow-lg" : "shadow-md", "group flex flex-row rounded-lg bg-white")}>
      <div
        className={cn(
          open ? "bg-slate-50" : "",
          "flex w-10 items-center justify-center rounded-l-lg border-b border-l border-t group-aria-expanded:rounded-bl-none",
          isInvalid ? "bg-red-400" : "bg-white group-hover:bg-slate-50"
        )}>
        <Hand className="size-4" />
      </div>
      <Collapsible.Root
        open={open}
        onOpenChange={setOpen}
        className="flex-1 rounded-r-lg border border-slate-200 transition-all duration-200 ease-in-out">
        <Collapsible.CollapsibleTrigger
          asChild
          className="flex cursor-pointer justify-between rounded-r-lg p-4 hover:bg-slate-50">
          <div>
            <div className="inline-flex">
              <div>
                <p className="text-sm font-semibold">{t("common.welcome_card")}</p>
                {!open && (
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {localSurvey?.welcomeCard?.enabled ? t("common.shown") : t("common.hidden")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-x-2">
              <Label htmlFor="welcome-toggle">
                {localSurvey?.welcomeCard?.enabled ? t("common.on") : t("common.off")}
              </Label>

              <Switch
                id="welcome-toggle"
                checked={localSurvey?.welcomeCard?.enabled}
                onClick={(e) => {
                  e.stopPropagation();
                  const newEnabledState = !localSurvey.welcomeCard?.enabled;
                  handleWelcomeToggle(newEnabledState);
                  if (newEnabledState && !open) {
                    setActiveElementId("start");
                  }
                }}
              />
            </div>
          </div>
        </Collapsible.CollapsibleTrigger>
        <Collapsible.CollapsibleContent className={`flex flex-col px-4 ${open && "pb-6"}`}>
          <form>
            <div className="mt-2">
              <Label htmlFor="companyLogo">{t("workspace.surveys.edit.company_logo")}</Label>
            </div>
            <div className="mt-3 flex w-full items-center justify-center">
              <FileInput
                id="welcome-card-image"
                allowedFileExtensions={["png", "jpeg", "jpg", "webp", "heic"]}
                workspaceId={workspaceId}
                onFileUpload={(url: string[] | undefined) => {
                  if (url?.length && url[0]) {
                    updateSurvey({ fileUrl: url[0], videoUrl: undefined });
                  } else {
                    updateSurvey({ fileUrl: undefined, videoUrl: undefined });
                  }
                }}
                fileUrl={localSurvey?.welcomeCard?.fileUrl}
                maxSizeInMB={5}
                isStorageConfigured={isStorageConfigured}
              />
            </div>
            <div className="mt-3">
              <ElementFormInput
                id="headline"
                value={localSurvey.welcomeCard.headline}
                label={t("common.note") + "*"}
                localSurvey={localSurvey}
                elementIdx={-1}
                isInvalid={isInvalid}
                updateSurvey={updateSurvey}
                locale={locale}
                isStorageConfigured={isStorageConfigured}
                isExternalUrlsAllowed={isExternalUrlsAllowed}
              />
            </div>
            <div className="mt-3">
              <ElementFormInput
                id="subheader"
                value={localSurvey.welcomeCard.subheader}
                label={t("workspace.surveys.edit.welcome_message")}
                localSurvey={localSurvey}
                elementIdx={-1}
                isInvalid={isInvalid}
                updateSurvey={updateSurvey}
                locale={locale}
                isStorageConfigured={isStorageConfigured}
                isExternalUrlsAllowed={isExternalUrlsAllowed}
              />
            </div>

            <div className="mt-3 flex justify-between gap-8">
              <div className="flex w-full gap-x-2">
                <div className="w-full">
                  <ElementFormInput
                    id="buttonLabel"
                    value={localSurvey.welcomeCard.buttonLabel}
                    localSurvey={localSurvey}
                    elementIdx={-1}
                    maxLength={48}
                    placeholder={t("common.next")}
                    isInvalid={isInvalid}
                    updateSurvey={updateSurvey}
                    label={t("workspace.surveys.edit.next_button_label")}
                    locale={locale}
                    isStorageConfigured={isStorageConfigured}
                    isExternalUrlsAllowed={isExternalUrlsAllowed}
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center">
              <div className="mr-2">
                <Switch
                  id="timeToFinish"
                  name="timeToFinish"
                  checked={localSurvey?.welcomeCard?.timeToFinish}
                  onCheckedChange={() =>
                    updateSurvey({ timeToFinish: !localSurvey.welcomeCard.timeToFinish })
                  }
                />
              </div>
              <div className="flex-column">
                <Label htmlFor="timeToFinish">{t("common.time_to_finish")}</Label>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {t("workspace.surveys.edit.display_an_estimate_of_completion_time_for_survey")}
                </div>
              </div>
            </div>
            {localSurvey?.type === "link" && (
              <div className="mt-6 flex items-center">
                <div className="mr-2">
                  <Switch
                    id="showResponseCount"
                    name="showResponseCount"
                    checked={localSurvey?.welcomeCard?.showResponseCount}
                    onCheckedChange={() =>
                      updateSurvey({ showResponseCount: !localSurvey.welcomeCard.showResponseCount })
                    }
                  />
                </div>
                <div className="flex-column">
                  <Label htmlFor="showResponseCount">{t("common.show_response_count")}</Label>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {t("workspace.surveys.edit.display_number_of_responses_for_survey")}
                  </div>
                </div>
              </div>
            )}
          </form>
        </Collapsible.CollapsibleContent>
      </Collapsible.Root>
    </div>
  );
};
