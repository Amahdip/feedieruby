import { TUserLocale } from "@salamruby/types/user";

export const RTL_LOCALES = ["fa-IR"] as const satisfies readonly TUserLocale[];

export const isRtlLocale = (locale: string): boolean =>
  RTL_LOCALES.some((rtlLocale) => locale.toLowerCase().startsWith(rtlLocale.toLowerCase().split("-")[0]));

export const getSidebarDropdownSide = (isRtl: boolean): "left" | "right" => (isRtl ? "left" : "right");
