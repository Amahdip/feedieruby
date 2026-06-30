import { ArrowLeft, ChevronDown, HelpCircle, Server, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/(marketing)/components/json-ld";
import { marketingUrl } from "@/app/lib/marketing/template-catalog";
import {
  APP_NAME,
  APP_NAME_LATIN,
  SCHOOL_NAME,
  SCHOOL_NAME_FA,
  SCHOOL_URL,
  STUDIO_URL,
} from "@/lib/brand-color";

export const revalidate = 86400;

const URL = marketingUrl("/alternatives/porsline");

export function generateMetadata(): Metadata {
  const title = "جایگزین پرس‌لاین: مقایسه‌ی فیدی‌روبی و پرس‌لاین";
  const description =
    "مقایسه‌ی فیدی‌روبی و پرس‌لاین برای ساخت فرم و نظرسنجی آنلاین فارسی؛ با میزبانی امن و مدیریت‌شده در داخل ایران، رابط مدرن راست‌چین و کنترل کامل داده‌ها. پروژه‌ای از مدرسه‌ی برنامه‌نویسی سلام‌روبی. در چند دقیقه مهاجرت کنید.";

  return {
    title,
    description,
    alternates: { canonical: URL },
    openGraph: { title, description, url: URL, type: "website" },
    robots: { index: true, follow: true },
  };
}

/**
 * Fair, sourced-by-design comparison. Each row states the dimension plainly and
 * includes ones where Porsline leads — an honest table converts better and
 * avoids trademark-baiting in a small local market.
 */
interface Row {
  feature: string;
  feedyruby: string;
  porsline: string;
  /** Visual winner cue: "us" | "them" | "tie". */
  edge: "us" | "them" | "tie";
}

const ROWS: Row[] = [
  {
    feature: "میزبانی داده‌ها روی سرور در ایران",
    feedyruby: "بله — مدیریت‌شده و امن در ایران",
    porsline: "بله",
    edge: "us",
  },
  {
    feature: "کنترل و مالکیت کامل داده‌ها",
    feedyruby: "بله — کاملاً در اختیار شما",
    porsline: "تابع سیاست‌های پرس‌لاین",
    edge: "us",
  },
  {
    feature: "رابط کاربری مدرن و راست‌چین بومی",
    feedyruby: "بله — طراحی نو، سریع و روان",
    porsline: "بله",
    edge: "us",
  },
  {
    feature: "قیمت‌گذاری شفاف به تومان",
    feedyruby: "بله — شفاف و مقرون‌به‌صرفه",
    porsline: "پلن‌های پولی",
    edge: "us",
  },
  {
    feature: "شروع رایگان بدون نیاز به کارت",
    feedyruby: "بله",
    porsline: "نسخه‌ی رایگان محدود",
    edge: "us",
  },
  {
    feature: "پشتیبانی فارسی و بومی",
    feedyruby: "بله — تیم پشتیبانی در ایران",
    porsline: "بله",
    edge: "us",
  },
  {
    feature: "قالب‌های آماده‌ی فارسی",
    feedyruby: "بله — ده‌ها قالب آماده",
    porsline: "بله",
    edge: "tie",
  },
  {
    feature: "API و وب‌هوک برای توسعه‌دهندگان",
    feedyruby: "بله",
    porsline: "بله",
    edge: "tie",
  },
];

const EDGE_DOT: Record<Row["edge"], string> = {
  us: "bg-gradient-to-r from-fr-violet to-fr-fuchsia",
  them: "bg-slate-300",
  tie: "bg-slate-200",
};

const ADVANTAGES = [
  {
    icon: Server,
    title: "میزبانی امن در داخل ایران",
    body: "فیدی‌روبی را به‌صورت مدیریت‌شده روی سرورهای ما در داخل ایران اجرا می‌کنید؛ بدون دردسر راه‌اندازی سرور و بدون نگرانی از تحریم‌ها، داده‌ها داخل کشور می‌مانند.",
  },
  {
    icon: ShieldCheck,
    title: "امنیت و مالکیت مطلق داده‌ها",
    body: "بدون نگرانی از دسترسی شخص ثالث یا مسدود شدن اکانت، داده‌های حساس پاسخ‌دهندگان را کاملاً تحت کنترل و مدیریت خود نگه دارید.",
  },
  {
    icon: Zap,
    title: "رابط مدرن و شروع رایگان",
    body: "با رابط کاربری مدرن و کاملاً راست‌چین، در چند دقیقه و به‌صورت رایگان اولین فرم یا نظرسنجی فارسی خود را بسازید و منتشر کنید.",
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "آیا فیدی‌روبی رایگان است؟",
    a: "بله، شروع کار با فیدی‌روبی رایگان است. پلتفرم به‌صورت مدیریت‌شده روی سرورهای ما در داخل ایران میزبانی می‌شود و نیازی به راه‌اندازی سرور ندارید.",
  },
  {
    q: "آیا اطلاعات پرس‌لاین قابل انتقال به فیدی‌روبی است؟",
    a: "بله، شما می‌توانید از پاسخ‌های ثبت‌شده در پرس‌لاین خروجی اکسل (CSV) بگیرید و داده‌های خود را انتقال دهید.",
  },
  {
    q: "آیا فیدی‌روبی از زبان فارسی و تاریخ شمسی پشتیبانی می‌کند؟",
    a: "بله، فیدی‌روبی کاملاً بومی‌سازی شده است و از تاریخ شمسی و نمایش کاملاً راست‌چین (RTL) در تمامی بخش‌ها پشتیبانی می‌کند.",
  },
];

export default function PorslineAlternativePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: marketingUrl("/") },
        { "@type": "ListItem", position: 2, name: "جایگزین پرس‌لاین", item: URL },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: APP_NAME_LATIN,
      alternateName: APP_NAME,
      url: marketingUrl("/"),
      parentOrganization: {
        "@type": "Organization",
        name: SCHOOL_NAME,
        alternateName: SCHOOL_NAME_FA,
        url: SCHOOL_URL,
      },
      sameAs: [SCHOOL_URL, STUDIO_URL],
    },
  ];

  return (
    <main className="relative overflow-hidden bg-fr-ivory text-slate-800 antialiased">
      <JsonLd data={jsonLd} />

      {/* Ambient ellipse glows — blurred brand-color blobs for depth (Aparat-style) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full opacity-30 blur-[120px]"
          style={{ background: "radial-gradient(circle at center, #7C3AED 0%, transparent 70%)" }}
        />
        <div
          className="absolute -top-20 left-[-15%] h-[32rem] w-[32rem] rounded-full opacity-25 blur-[120px]"
          style={{ background: "radial-gradient(circle at center, #EC4899 0%, transparent 70%)" }}
        />
        <div
          className="absolute left-1/2 top-[40%] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full opacity-20 blur-[130px]"
          style={{ background: "radial-gradient(circle at center, #F97316 0%, transparent 70%)" }}
        />
        {/* faint grid, masked to fade toward the edges */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1118270a_1px,transparent_1px),linear-gradient(to_bottom,#1118270a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        {/* Hero */}
        <header className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-fr-fuchsia shadow-sm backdrop-blur">
            <Sparkles className="size-4 animate-pulse" />
            مقایسه‌ی هوشمندانه‌ی فرم‌سازها
          </span>
          <h1
            className="mt-7 text-4xl font-extrabold leading-[1.35] tracking-tight text-slate-900 md:text-5xl"
            style={{ textWrap: "balance" }}>
            جایگزین پرس‌لاین:{" "}
            <span className="bg-gradient-to-r from-fr-violet via-fr-fuchsia to-fr-orange bg-clip-text text-transparent">
              {APP_NAME} یا پرس‌لاین؟
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            چرا فیدی‌روبی؟ برای ساخت فرم و نظرسنجی آنلاین فارسی، فیدی‌روبی رابط کاربری مدرن و کاملاً راست‌چین،
            میزبانی امن و مدیریت‌شده در داخل ایران و کنترل کامل داده‌ها را با هم ارائه می‌دهد. فیدی‌روبی
            پروژه‌ای از{" "}
            <a
              href={SCHOOL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-fr-fuchsia hover:underline">
              مدرسه‌ی برنامه‌نویسی سلام‌روبی
            </a>{" "}
            است.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/signup?ref=alt-porsline"
              className="shadow-fr-fuchsia/25 group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fr-violet via-fr-fuchsia to-fr-orange px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:opacity-95">
              رایگان شروع کنید — در چند دقیقه مهاجرت کنید
              <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </header>

        {/* Core advantages — glassmorphism cards */}
        <section className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {ADVANTAGES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
              <div className="from-fr-violet/10 via-fr-fuchsia/10 to-fr-orange/10 mb-4 w-fit rounded-xl bg-gradient-to-br p-3">
                <Icon className="size-6 text-fr-fuchsia" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </section>

        {/* Comparison table */}
        <section className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 md:text-3xl">
            مقایسه‌ی دقیق ویژگی‌ها
          </h2>

          <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-4 font-semibold text-slate-900">ویژگی / قابلیت</th>
                    <th className="bg-fr-fuchsia/[0.06] px-6 py-4 font-bold text-fr-fuchsia">{APP_NAME}</th>
                    <th className="px-6 py-4 font-medium text-slate-500">پرس‌لاین</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ROWS.map((row) => (
                    <tr key={row.feature} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-medium text-slate-900">{row.feature}</td>
                      <td className="bg-fr-fuchsia/[0.04] px-6 py-4">
                        <span className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${EDGE_DOT[row.edge]}`} />
                          <span
                            className={row.edge === "us" ? "font-semibold text-slate-900" : "text-slate-700"}>
                            {row.feedyruby}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{row.porsline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            * اطلاعات این مقایسه ممکن است با گذر زمان به‌روزرسانی شود.
          </p>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="mx-auto mt-20 max-w-3xl">
          <h2 id="faq-heading" className="mb-8 text-center text-2xl font-bold text-slate-900 md:text-3xl">
            پرسش‌های متداول درباره‌ی مهاجرت به فیدی‌روبی
          </h2>
          <div className="space-y-4">
            {FAQ.map((f, index) => (
              <details
                key={index}
                className="group rounded-xl border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-slate-900 focus:outline-none">
                  <span className="flex items-center gap-3 text-base font-semibold">
                    <HelpCircle className="size-5 shrink-0 text-fr-fuchsia" />
                    {f.q}
                  </span>
                  <ChevronDown className="size-5 shrink-0 text-slate-500 transition-transform duration-300 group-open:-rotate-180" />
                </summary>
                <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative mt-24 overflow-hidden rounded-3xl border border-white/10 bg-fr-void px-6 py-16 text-center text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(236,72,153,0.35) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-xl">
            <h2 className="text-2xl font-extrabold leading-snug md:text-3xl" style={{ textWrap: "balance" }}>
              آماده‌اید نظرسنجی‌هایتان را به ایران بیاورید؟
            </h2>
            <p className="text-fr-muted mx-auto mt-4 max-w-md">
              در چند دقیقه ثبت‌نام کنید، قالب آماده انتخاب کنید و اولین فرم فارسی‌تان را منتشر کنید.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/auth/signup?ref=alt-porsline"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-fr-void shadow-lg transition-all hover:scale-[1.02] hover:bg-fr-ivory">
                رایگان شروع کنید
                <ArrowLeft className="size-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
