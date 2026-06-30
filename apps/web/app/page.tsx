import type { Metadata } from "next";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getOnboardingWorkspace } from "@/app/(app)/(onboarding)/lib/onboarding-workspace";
import { getOnboardingRedirectPath } from "@/app/(app)/(onboarding)/lib/redirect-if-onboarding-complete";
import { JsonLd } from "@/app/(marketing)/components/json-ld";
import ClientWorkspaceRedirect from "@/app/ClientWorkspaceRedirect";
import {
  APP_NAME,
  APP_NAME_LATIN,
  SCHOOL_NAME,
  SCHOOL_NAME_FA,
  SCHOOL_URL,
  STUDIO_URL,
} from "@/lib/brand-color";
import { WEBAPP_URL } from "@/lib/constants";
import { getIsFreshInstance } from "@/lib/instance/service";
import { getMembershipByUserIdOrganizationId } from "@/lib/membership/service";
import { getAccessFlags } from "@/lib/membership/utils";
import { getOrganizationsByUserId } from "@/lib/organization/service";
import { getUser } from "@/lib/user/service";
import { getUserWorkspaces } from "@/lib/workspace/service";
import { getLocale } from "@/lingodotdev/language";
import { getTranslate } from "@/lingodotdev/server";
import { authOptions } from "@/modules/auth/lib/authOptions";
import { LandingPage } from "@/modules/marketing/components/landing-page";
import { ClientLogout } from "@/modules/ui/components/client-logout";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Server-rendered structured data for the public homepage. Connects FeedyRuby
 * to its parent brand SalamRuby (parentOrganization + sameAs) so search engines
 * treat them as one entity graph, and exposes the landing FAQ as a FAQPage for
 * rich results. Built server-side so crawlers see it without running JS.
 */
async function buildHomeJsonLd() {
  const locale = await getLocale();
  const t = await getTranslate(locale);
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
  const session: Session | null = await getServerSession(authOptions);
  const isFreshInstance = await getIsFreshInstance();

  if (!session) {
    if (isFreshInstance) {
      return redirect("/setup/intro");
    } else {
      const jsonLd = await buildHomeJsonLd();
      return (
        <>
          <JsonLd data={jsonLd} />
          <LandingPage />
        </>
      );
    }
  }

  const user = await getUser(session.user.id);
  if (!user) {
    return <ClientLogout />;
  }

  const userOrganizations = await getOrganizationsByUserId(session.user.id);

  if (userOrganizations.length === 0) {
    return redirect("/setup/organization/create");
  }

  // Collect workspace IDs across all organizations
  const allWorkspaceIds: string[] = [];
  for (const org of userOrganizations) {
    const workspaces = await getUserWorkspaces(user.id, org.id);
    for (const ws of workspaces) {
      allWorkspaceIds.push(ws.id);
    }
  }

  const currentUserMembership = await getMembershipByUserIdOrganizationId(
    session.user.id,
    userOrganizations[0].id
  );

  const { isManager, isOwner } = getAccessFlags(currentUserMembership?.role);

  if (allWorkspaceIds.length === 0 && !isOwner && !isManager) {
    return redirect(`/organizations/${userOrganizations[0].id}/landing`);
  }

  if (isOwner || isManager) {
    const onboardingWorkspace = await getOnboardingWorkspace(session.user.id, userOrganizations[0].id);
    const onboardingRedirectPath = await getOnboardingRedirectPath({
      organizationId: userOrganizations[0].id,
      workspace: onboardingWorkspace,
    });

    if (onboardingRedirectPath) {
      return redirect(onboardingRedirectPath);
    }
  }

  return <ClientWorkspaceRedirect userWorkspaceIds={allWorkspaceIds} />;
};

export default Page;
