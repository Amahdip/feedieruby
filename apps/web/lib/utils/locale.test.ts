import { describe, expect, test } from "vitest";
import { AVAILABLE_LOCALES, DEFAULT_LOCALE } from "@/lib/constants";
import { appLanguages } from "@/lib/i18n/utils";
import { findMatchingLocale } from "./locale";

describe("locale", () => {
  test("returns DEFAULT_LOCALE regardless of browser language", async () => {
    const result = await findMatchingLocale();

    expect(result).toBe(DEFAULT_LOCALE);
  });

  test("Swedish locale (sv-SE) remains available in app languages", () => {
    expect(AVAILABLE_LOCALES).toContain("sv-SE");

    const swedishLanguage = appLanguages.find((lang) => lang.code === "sv-SE");
    expect(swedishLanguage).toBeDefined();
    expect(swedishLanguage?.label["en-US"]).toBe("Swedish");
  });
});
