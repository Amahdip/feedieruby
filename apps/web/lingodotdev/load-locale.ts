import { TUserLocale } from "@salamruby/types/user";

type LocaleModule = { default: Record<string, unknown> };

const localeImporters: Record<TUserLocale, () => Promise<LocaleModule>> = {
  "de-DE": () => import("../locales/de-DE.json"),
  "en-US": () => import("../locales/en-US.json"),
  "es-ES": () => import("../locales/es-ES.json"),
  "fa-IR": () => import("../locales/fa-IR.json"),
  "fr-FR": () => import("../locales/fr-FR.json"),
  "hu-HU": () => import("../locales/hu-HU.json"),
  "ja-JP": () => import("../locales/ja-JP.json"),
  "nl-NL": () => import("../locales/nl-NL.json"),
  "pt-BR": () => import("../locales/pt-BR.json"),
  "pt-PT": () => import("../locales/pt-PT.json"),
  "ro-RO": () => import("../locales/ro-RO.json"),
  "ru-RU": () => import("../locales/ru-RU.json"),
  "sv-SE": () => import("../locales/sv-SE.json"),
  "tr-TR": () => import("../locales/tr-TR.json"),
  "zh-Hans-CN": () => import("../locales/zh-Hans-CN.json"),
  "zh-Hant-TW": () => import("../locales/zh-Hant-TW.json"),
};

export const isSupportedLocale = (locale: string): locale is TUserLocale => locale in localeImporters;

export const importLocaleResources = (locale: string): Promise<LocaleModule> => {
  if (isSupportedLocale(locale)) {
    return localeImporters[locale]();
  }
  return localeImporters["en-US"]();
};

export const loadLocaleResources = async (locale: TUserLocale): Promise<Record<string, unknown>> => {
  const module = await importLocaleResources(locale);
  return module.default;
};
