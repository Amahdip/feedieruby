"use client";

import { useTranslation } from "react-i18next";
import { isRtlLocale } from "@/lib/i18n/rtl";

export const useRtl = (): boolean => {
  const { i18n } = useTranslation();
  return isRtlLocale(i18n.resolvedLanguage ?? i18n.language);
};
