import { Metadata, Viewport } from "next";
import React from "react";
import { NoScriptWarning } from "@/app/components/NoScriptWarning";
import { SentryProvider } from "@/app/sentry/SentryProvider";
import { APP_NAME, APP_NAME_LATIN } from "@/lib/brand-color";
import { cn } from "@/lib/cn";
import {
  DEFAULT_LOCALE,
  IS_PRODUCTION,
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
  SENTRY_RELEASE,
  WEBAPP_URL,
  isRtlLocale,
} from "@/lib/constants";
import { iranSansX } from "@/lib/fonts/iran-sans-x";
import { I18nProvider } from "@/lingodotdev/client";
import { getLocale } from "@/lingodotdev/language";
import { loadLocaleResources } from "@/lingodotdev/load-locale";
import "../modules/ui/globals.css";

export const viewport: Viewport = {
  themeColor: "#EC4899",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(WEBAPP_URL || "https://feedyruby.ir"),
  title: {
    template: `%s | ${APP_NAME}`,
    default: "فیدی‌روبی | فرم‌ساز و پرسش‌نامه ساز آنلاین",
  },
  description:
    "فیدی‌روبی (FeedyRuby) پیشروترین پلتفرم بومی فرم‌ساز و پرسش‌نامه ساز آنلاین در ایران. نظرسنجی راست‌چین، رابط کاربری مدرن و داده‌های ذخیره‌شده روی سرورهای داخل ایران.",
  keywords: [
    "فرم‌ساز",
    "فرم‌ساز آنلاین",
    "پرسش‌نامه ساز",
    "پرسش‌نامه ساز آنلاین",
    "نظرسنجی آنلاین",
    "ساخت نظرسنجی",
    "نظرسنجی فارسی",
    "فرم‌ساز راست‌چین",
    "FeedyRuby",
    "پرسش‌نامه آنلاین ایران",
    "سنجش رضایت مشتریان",
    "فرم‌ساز رایگان",
  ],
  icons: {
    icon: "/favicon/favicon-32x32.png",
    apple: "/favicon/apple-touch-icon.png",
  },
  applicationName: APP_NAME_LATIN,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "فیدی‌روبی | فرم‌ساز و پرسش‌نامه ساز آنلاین",
    description:
      "سیستم پیشرفته نظرسنجی آنلاین و دریافت بازخورد با پنل فارسی، راست‌چین و امنیت بالای داده‌ها روی سرورهای ایرانی.",
    type: "website",
    locale: "fa_IR",
    siteName: APP_NAME_LATIN,
    url: "https://feedyruby.ir",
    images: [
      {
        url: "https://feedyruby.ir/favicon/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "فیدی‌روبی",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "فیدی‌روبی | فرم‌ساز و پرسش‌نامه ساز آنلاین",
    description:
      "سیستم پیشرفته نظرسنجی آنلاین و دریافت بازخورد با پنل فارسی، راست‌چین و امنیت بالای داده‌ها روی سرورهای ایرانی.",
    images: ["https://feedyruby.ir/favicon/android-chrome-512x512.png"],
  },
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
