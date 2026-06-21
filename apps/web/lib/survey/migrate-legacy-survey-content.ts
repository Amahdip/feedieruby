import type { TI18nString } from "@salamruby/types/i18n";
import type { TSurvey } from "@salamruby/types/surveys/types";
import { structuredClone } from "@/lib/pollyfills/structuredClone";

const stripHtmlTags = (value: string): string =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

const isComingSoonText = (value: string): boolean => /coming\s+soon/i.test(stripHtmlTags(value));

const migrateI18nField = (field: TI18nString | undefined, replacement: string): TI18nString | undefined => {
  if (!field) {
    return field;
  }

  const next: TI18nString = { ...field };
  let changed = false;

  for (const [key, value] of Object.entries(next)) {
    if (typeof value === "string" && isComingSoonText(value)) {
      next[key] = replacement;
      changed = true;
    }
  }

  return changed ? next : field;
};

const LEGACY_BLOCK_NAME_PATTERN = /^(?:Main Block|Block \d+)$/i;

export const migrateLegacySurveyContent = (
  survey: TSurvey,
  options: { comingSoonHeadline: string; getBlockName: (blockIndex: number) => string }
): TSurvey => {
  const next = structuredClone(survey);

  next.blocks = next.blocks.map((block, index) => {
    const blockName = block.name?.trim() ?? "";
    if (LEGACY_BLOCK_NAME_PATTERN.test(blockName)) {
      return { ...block, name: options.getBlockName(index) };
    }

    return block;
  });

  for (const block of next.blocks) {
    for (const element of block.elements) {
      const migratedHeadline = migrateI18nField(element.headline, options.comingSoonHeadline);
      if (migratedHeadline !== undefined && migratedHeadline !== element.headline) {
        element.headline = migratedHeadline;
      }
    }
  }

  return next;
};
