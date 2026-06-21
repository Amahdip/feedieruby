import { Metadata } from "next";
import React from "react";
import { NoScriptWarning } from "@/app/components/NoScriptWarning";
import { SentryProvider } from "@/app/sentry/SentryProvider";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { APP_NAME, APP_NAME_LATIN } from "@/lib/brand-color";
import { cn } from "@/lib/cn";
import {
  DEFAULT_LOCALE,
  IS_PRODUCTION,
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
  SENTRY_RELEASE,
  isRtlLocale,
} from "@/lib/constants";
import { iranSansX } from "@/lib/fonts/iran-sans-x";
import { I18nProvider } from "@/lingodotdev/client";
import { getLocale } from "@/lingodotdev/language";
import { loadLocaleResources } from "@/lingodotdev/load-locale";
import "../modules/ui/globals.css";

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: "Survey and feedback platform",
  icons: {
    icon: BRAND_ASSETS.iconRubyTilePng,
    apple: BRAND_ASSETS.iconRubyTilePng,
  },
  applicationName: APP_NAME_LATIN,
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const locale = await getLocale();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";
  const localeResources = await loadLocaleResources(locale);

  return (
    <html lang={locale} dir={dir} translate="no" className={iranSansX.variable}>
      <body className={cn("flex h-dvh flex-col transition-all ease-in-out", iranSansX.variable)}>
        <NoScriptWarning locale={locale} />
        <SentryProvider
          sentryDsn={SENTRY_DSN}
          sentryRelease={SENTRY_RELEASE}
          sentryEnvironment={SENTRY_ENVIRONMENT}
          isEnabled={IS_PRODUCTION}>
          <I18nProvider language={locale} defaultLanguage={DEFAULT_LOCALE} localeResources={localeResources}>
            {children}
          </I18nProvider>
        </SentryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
