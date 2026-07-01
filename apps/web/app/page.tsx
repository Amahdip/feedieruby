import type { Metadata } from "next";
import { JsonLd } from "@/app/(marketing)/components/json-ld";
import RedirectAuthedHome from "@/app/RedirectAuthedHome";
import {
  APP_NAME,
  APP_NAME_LATIN,
  SCHOOL_NAME,
  SCHOOL_NAME_FA,
  SCHOOL_URL,
  STUDIO_URL,
} from "@/lib/brand-color";
import { DEFAULT_LOCALE, WEBAPP_URL } from "@/lib/constants";
import { getTranslate } from "@/lingodotdev/server";
import { LandingPage } from "@/modules/marketing/components/landing-page";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Server-rendered structured data for the public homepage. Built with the
 * default locale (no session read) so the page renders statically and stays
 * edge-cacheable. Connects FeedyRuby to its parent brand SalamRuby and exposes
 * the landing FAQ as a FAQPage for rich results.
 */
async function buildHomeJsonLd() {
  const t = await getTranslate(DEFAULT_LOCALE);
  const base = (WEBAPP_URL || "https://feedyruby.ir").replace(/\/$/, "");
  const logo = `${base}/favicon/android-chrome-512x512.png`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: APP_NAME_LATIN,
    alternateName: APP_NAME,
    url: base,
    logo,
    parentOrganization: {
      "@type": "Organization",
      name: SCHOOL_NAME,
      alternateName: SCHOOL_NAME_FA,
      url: SCHOOL_URL,
    },
    sameAs: [SCHOOL_URL, STUDIO_URL],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: APP_NAME,
    url: base,
    inLanguage: "fa-IR",
    publisher: { "@id": `${base}/#organization` },
  };

  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    alternateName: APP_NAME_LATIN,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: base,
    inLanguage: "fa-IR",
    offers: { "@type": "Offer", price: "0", priceCurrency: "IRR" },
    publisher: { "@id": `${base}/#organization` },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4].map((i) => ({
      "@type": "Question",
      name: t(`marketing.landing.faq.q${i}`),
      acceptedAnswer: { "@type": "Answer", text: t(`marketing.landing.faq.a${i}`) },
    })),
  };

  return [organization, website, softwareApplication, faqPage];
}

const Page = async () => {
  const jsonLd = await buildHomeJsonLd();
  return (
    <>
      <JsonLd data={jsonLd} />
      <RedirectAuthedHome />
      <LandingPage />
    </>
  );
};

export default Page;
