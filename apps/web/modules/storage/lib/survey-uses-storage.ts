import type { TSurvey } from "@salamruby/types/surveys/types";
import { getElementsFromBlocks } from "@/modules/survey/lib/client-utils";

const isStoredAssetUrl = (url: string | undefined | null): boolean =>
  Boolean(url && url.includes("/storage/"));

export const surveyUsesStorage = (survey: TSurvey): boolean => {
  const styling = survey.styling;

  if (styling?.logo?.url && isStoredAssetUrl(styling.logo.url)) {
    return true;
  }

  if (styling?.background?.bgType === "upload" && styling.background.bg) {
    return true;
  }

  if (styling?.background?.bgType === "image" && isStoredAssetUrl(styling.background.bg)) {
    return true;
  }

  if (isStoredAssetUrl(survey.welcomeCard?.fileUrl) || isStoredAssetUrl(survey.welcomeCard?.videoUrl)) {
    return true;
  }

  for (const ending of survey.endings) {
    if (ending.type !== "endScreen") {
      continue;
    }

    if (isStoredAssetUrl(ending.imageUrl) || isStoredAssetUrl(ending.videoUrl)) {
      return true;
    }
  }

  const elements = getElementsFromBlocks(survey.blocks);

  if (elements.some((element) => element.type === "fileUpload" || element.type === "pictureSelection")) {
    return true;
  }

  return false;
};
