"use client";

import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Code,
  Flame,
  HelpCircle,
  Mail,
  Menu,
  MessageCircle,
  ShieldAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SCHOOL_URL } from "@/lib/brand-color";
import { AuroraBackground } from "@/modules/marketing/components/aurora-background";
import { HeroAurora } from "@/modules/marketing/components/hero-aurora";
import { TimeNetworkBackground } from "@/modules/marketing/components/time-network-section";
import { FeedyRubyWordmark } from "@/modules/ui/components/feedyruby-brand";

export const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { t, i18n } = useTranslation();

  const isRtl = i18n.language === "fa-IR" || i18n.language.startsWith("fa");

  // Keep <html> lang/dir in sync with the chosen language. Without this, the
  // client-side language toggle leaves the page as fa-IR/rtl — so English
  // renders right-to-left and the Persian font shapes Latin digits as Persian.
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [i18n.language, isRtl]);

  const toggleLanguage = () => {
    const nextLang = isRtl ? "en-US" : "fa-IR";
    i18n.changeLanguage(nextLang);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      icon: <MessageCircle className="size-6 text-fr-fuchsia" />,
      title: t("marketing.landing.features.inAppSurveys.title"),
      description: t("marketing.landing.features.inAppSurveys.description"),
    },
    {
      icon: <Mail className="size-6 text-fr-fuchsia" />,
      title: t("marketing.landing.features.emailLinkSurveys.title"),
      description: t("marketing.landing.features.emailLinkSurveys.description"),
    },
    {
      icon: <BarChart3 className="size-6 text-fr-fuchsia" />,
      title: t("marketing.landing.features.realTimeResponses.title"),
      description: t("marketing.landing.features.realTimeResponses.description"),
    },
    {
      icon: <Flame className="size-6 text-fr-fuchsia" />,
      title: t("marketing.landing.features.advancedIntegrations.title"),
      description: t("marketing.landing.features.advancedIntegrations.description"),
    },
    {
      icon: <ShieldAlert className="size-6 text-fr-fuchsia" />,
      title: t("marketing.landing.features.privacyFirst.title"),
      description: t("marketing.landing.features.privacyFirst.description"),
    },
    {
      icon: <Code className="size-6 text-fr-fuchsia" />,
      title: t("marketing.landing.features.openSource.title"),
      description: t("marketing.landing.features.openSource.description"),
    },
  ];

  const pricingTiers = [
    {
      name: t("marketing.landing.pricing.free.name"),
      price: t("marketing.landing.pricing.free.price"),
      description: t("marketing.landing.pricing.free.description"),
      features: [
        t("marketing.landing.pricing.free.f1"),
        t("marketing.landing.pricing.free.f2"),
        t("marketing.landing.pricing.free.f3"),
        t("marketing.landing.pricing.free.f4"),
        t("marketing.landing.pricing.free.f5"),
      ],
      cta: t("marketing.landing.pricing.free.cta"),
      href: "/auth/signup",
      highlighted: false,
    },
    {
      name: t("marketing.landing.pricing.starter.name"),
      price: t("marketing.landing.pricing.starter.price"),
      period: t("marketing.landing.pricing.starter.period"),
      description: t("marketing.landing.pricing.starter.description"),
      features: [
        t("marketing.landing.pricing.starter.f1"),
        t("marketing.landing.pricing.starter.f2"),
        t("marketing.landing.pricing.starter.f3"),
        t("marketing.landing.pricing.starter.f4"),
        t("marketing.landing.pricing.starter.f5"),
      ],
      cta: t("marketing.landing.pricing.starter.cta"),
      href: "/auth/signup",
      highlighted: true,
    },
    {
      name: t("marketing.landing.pricing.pro.name"),
      price: t("marketing.landing.pricing.pro.price"),
      period: t("marketing.landing.pricing.pro.period"),
      description: t("marketing.landing.pricing.pro.description"),
      features: [
        t("marketing.landing.pricing.pro.f1"),
        t("marketing.landing.pricing.pro.f2"),
        t("marketing.landing.pricing.pro.f3"),
        t("marketing.landing.pricing.pro.f4"),
        t("marketing.landing.pricing.pro.f5"),
      ],
      cta: t("marketing.landing.pricing.pro.cta"),
      href: "/auth/signup",
      highlighted: false,
    },
    {
      name: t("marketing.landing.pricing.enterprise.name"),
      price: t("marketing.landing.pricing.enterprise.price"),
      description: t("marketing.landing.pricing.enterprise.description"),
      features: [
        t("marketing.landing.pricing.enterprise.f1"),
        t("marketing.landing.pricing.enterprise.f2"),
        t("marketing.landing.pricing.enterprise.f3"),
        t("marketing.landing.pricing.enterprise.f4"),
        t("marketing.landing.pricing.enterprise.f5"),
      ],
      cta: t("marketing.landing.pricing.enterprise.cta"),
      href: "mailto:sales@feedyruby.ir",
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: t("marketing.landing.faq.q1"),
      answer: t("marketing.landing.faq.a1"),
    },
    {
      question: t("marketing.landing.faq.q2"),
      answer: t("marketing.landing.faq.a2"),
    },
    {
      question: t("marketing.landing.faq.q3"),
      answer: t("marketing.landing.faq.a3"),
    },
    {
      question: t("marketing.landing.faq.q4"),
      answer: t("marketing.landing.faq.a4"),
    },
  ];

  return (
    <div className="selection:bg-fr-fuchsia/10 min-h-screen bg-fr-ivory text-slate-800 antialiased selection:text-fr-fuchsia">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <FeedyRubyWordmark className="h-8 w-auto max-w-[9rem]" isRtl={isRtl} priority />
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-fr-fuchsia">
              {t("marketing.landing.nav.features")}
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-fr-fuchsia">
              {t("marketing.landing.nav.pricing")}
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-fr-fuchsia">
              {t("marketing.landing.nav.faq")}
            </a>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <button
              onClick={toggleLanguage}
              className="rounded border border-slate-200 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-fr-fuchsia">
              {isRtl ? "English" : "فارسی"}
            </button>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              {t("marketing.landing.nav.signIn")}
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-fr-violet via-fr-fuchsia to-fr-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:scale-[1.02] hover:opacity-90">
              {t("marketing.landing.nav.signUp")}
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle mobile menu">
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-600">
                {t("marketing.landing.nav.features")}
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-600">
                {t("marketing.landing.nav.pricing")}
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-600">
                {t("marketing.landing.nav.faq")}
              </a>
              <hr className="border-slate-100" />
              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileMenuOpen(false);
                }}
                className="text-start text-base font-semibold text-fr-fuchsia">
                {isRtl ? "Switch to English" : "تغییر به فارسی"}
              </button>
              <hr className="border-slate-100" />
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-600">
                {t("marketing.landing.nav.signIn")}
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-fr-violet via-fr-fuchsia to-fr-orange px-4 py-2.5 text-base font-medium text-white shadow-sm transition-all hover:scale-[1.02] hover:opacity-90">
                {t("marketing.landing.nav.signUp")}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#07070E] py-24 text-white lg:py-36">
        <HeroAurora />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center lg:mx-auto lg:max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-fr-fuchsia ring-1 ring-inset ring-white/10 backdrop-blur">
              <span className="size-1.5 animate-pulse rounded-full bg-fr-fuchsia" />
              {t("marketing.landing.hero.badge")}
            </div>
            <h1
              className="mt-6 text-4xl font-extrabold leading-[1.4] tracking-tight text-white sm:text-5xl lg:text-6xl"
              style={{ textWrap: "balance" }}>
              {t("marketing.landing.hero.title")}{" "}
              <span className="bg-gradient-to-r from-fr-violet via-fr-fuchsia to-fr-orange bg-clip-text text-transparent">
                {t("marketing.landing.hero.titleMinutes")}
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 sm:text-xl">
              {t("marketing.landing.hero.description")}
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="shadow-fr-fuchsia/20 inline-flex items-center justify-center rounded-md bg-gradient-to-r from-fr-violet via-fr-fuchsia to-fr-orange px-6 py-3.5 text-base font-medium text-white shadow-lg transition-all hover:scale-[1.02] hover:opacity-90">
                {t("marketing.landing.hero.startFree")}
                <ArrowRight className="ms-2 size-5 rtl:rotate-180" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 px-6 py-3.5 text-base font-medium text-slate-100 backdrop-blur transition-all hover:bg-white/10">
                {t("marketing.landing.hero.learnMore")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-fr-ivory py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{ textWrap: "balance" }}>
              {t("marketing.landing.features.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
              {t("marketing.landing.features.subtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                <div className="bg-fr-fuchsia/10 mb-6 flex size-12 items-center justify-center rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 grow text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative overflow-hidden py-20 lg:py-32">
        <TimeNetworkBackground />
        {/* fade the top into the features section above */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-[#F5F4F8] to-[#F5F4F8]/0"
        />
        {/* fade the bottom into the FAQ section below */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-[#F5F4F8] to-[#F5F4F8]/0"
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ textWrap: "balance", color: "var(--tn-ink, #fff)" }}>
              {t("marketing.landing.pricing.title")}
            </h2>
            <p
              className="mx-auto mt-4 max-w-2xl text-base"
              style={{ color: "var(--tn-ink, #fff)", opacity: 0.78 }}>
              {t("marketing.landing.pricing.subtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`flex flex-col rounded-xl border bg-white p-8 shadow-sm transition-all ${
                  tier.highlighted
                    ? "ring-fr-fuchsia/20 relative border-fr-fuchsia ring-2 md:scale-[1.05]"
                    : "border-slate-200 hover:border-slate-300"
                }`}>
                {tier.highlighted && (
                  <span className="absolute right-1/2 top-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-fr-fuchsia px-3 py-0.5 text-xs font-semibold text-white">
                    {t("marketing.landing.pricing.popular")}
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{tier.price}</span>
                  {tier.period && <span className="text-sm font-medium text-slate-500">{tier.period}</span>}
                </div>
                <p className="mt-2 text-xs text-slate-500">{tier.description}</p>

                <ul className="mt-8 grow space-y-4">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check className="mt-0.5 size-4 shrink-0 text-fr-fuchsia" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`mt-8 inline-flex items-center justify-center rounded-md py-2.5 text-sm font-medium shadow-sm transition-colors ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-fr-violet via-fr-fuchsia to-fr-orange text-white hover:opacity-90"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}>
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="border-t border-slate-200 py-20 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{ textWrap: "balance" }}>
              {t("marketing.landing.faq.title")}
            </h2>
            <p className="mt-4 text-base text-slate-600">{t("marketing.landing.faq.subtitle")}</p>
          </div>

          <div className="mt-16 space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 bg-white transition-all">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between p-6 text-left focus:outline-none rtl:text-right">
                  <span className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <HelpCircle className="size-5 shrink-0 text-fr-fuchsia" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`size-5 text-slate-400 transition-transform duration-200 ${
                      activeFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeFaq === idx && (
                  <div className="border-t border-slate-100 px-6 py-4">
                    <p className="text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden bg-fr-void py-20 text-white">
        <AuroraBackground />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl" style={{ textWrap: "balance" }}>
            {t("marketing.landing.cta.title")}
          </h2>
          <p className="text-fr-muted mx-auto mt-4 max-w-xl text-lg">{t("marketing.landing.cta.subtitle")}</p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3.5 text-base font-semibold text-fr-void shadow-lg transition-all hover:scale-[1.02] hover:bg-fr-ivory">
              {t("marketing.landing.cta.signUpFree")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <FeedyRubyWordmark className="h-6 w-auto max-w-[8rem]" isRtl={isRtl} />
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
              <Link href="https://feedyruby.ir/terms" className="hover:text-fr-fuchsia">
                {t("marketing.landing.footer.terms")}
              </Link>
              <Link href="https://feedyruby.ir/privacy" className="hover:text-fr-fuchsia">
                {t("marketing.landing.footer.privacy")}
              </Link>
              <Link href="mailto:info@feedyruby.ir" className="hover:text-fr-fuchsia">
                {t("marketing.landing.footer.contact")}
              </Link>
            </div>
          </div>

          <hr className="my-8 border-slate-100" />

          <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-400 sm:flex-row">
            <p>{t("marketing.landing.footer.rights", { year: new Date().getFullYear() })}</p>
            <p className="flex items-center gap-1">
              <span>{t("marketing.landing.footer.madeByLead")}</span>
              <a
                href={SCHOOL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-500 transition-colors hover:text-fr-fuchsia hover:underline">
                {t("marketing.landing.footer.schoolName")}
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
