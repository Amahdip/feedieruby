import { TUserLocale } from "@salamruby/types/user";
import { DEFAULT_LOCALE } from "@/lib/constants";

export const findMatchingLocale = async (): Promise<TUserLocale> => {
  return DEFAULT_LOCALE;
};
