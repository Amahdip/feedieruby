"use client";

import i18n from "i18next";
import ICU from "i18next-icu";
import resourcesToBackend from "i18next-resources-to-backend";
import { ReactNode, useEffect, useRef, useState } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { logger } from "@salamruby/logger";
import { isRtlLocale } from "@/lib/i18n/rtl";
import { importLocaleResources } from "@/lingodotdev/load-locale";

let isInit = false;

interface I18nProviderProps {
  children: ReactNode;
  language: string;
  defaultLanguage: string;
  localeResources: Record<string, unknown>;
}

export const I18nProvider = ({ children, language, defaultLanguage, localeResources }: I18nProviderProps) => {
  const locale = language || defaultLanguage;
  const [isReady, setIsReady] = useState(false);
  const localeResourcesRef = useRef(localeResources);

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        if (isInit) {
          if (i18n.language !== locale) {
            await i18n.loadLanguages(locale);
            await i18n.changeLanguage(locale);
          }
          setIsReady(true);
          return;
        }

        await i18n
          .use(ICU)
          .use(initReactI18next)
          .use(
            resourcesToBackend((language: string) => {
              return importLocaleResources(language);
            })
          )
          .init({
            lng: locale,
            fallbackLng: defaultLanguage,
            interpolation: { escapeValue: false },
            showSupportNotice: false,
            resources: {
              [locale]: { translation: localeResourcesRef.current },
            },
            partialBundledLanguages: true,
          });
        isInit = true;
        setIsReady(true);
      } catch (error) {
        logger.error(error);
        setIsReady(true);
      }
    };

    void initializeI18n();
  }, [locale, defaultLanguage]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const resolvedLocale = i18n.resolvedLanguage ?? i18n.language;
    document.documentElement.lang = resolvedLocale;
    document.documentElement.dir = isRtlLocale(resolvedLocale) ? "rtl" : "ltr";
  }, [isReady, locale]);

  if (!isReady) {
    return null;
  }

  return (
    <I18nextProvider data-testid="i18next-provider" i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};
