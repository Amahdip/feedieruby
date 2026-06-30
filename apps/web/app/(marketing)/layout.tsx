import Link from "next/link";
import type { ReactNode } from "react";
import { APP_NAME, SCHOOL_NAME_FA, SCHOOL_URL } from "@/lib/brand-color";

/**
 * Shared chrome for the public marketing surface (templates, comparison pages).
 * The footer gives every indexed page consistent internal links back to the
 * hub pages and a crawlable link to the parent brand SalamRuby — so link equity
 * and topical context flow across the whole catalog, not just the homepage.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <footer className="mt-16 border-t border-slate-200 py-10 text-sm text-slate-500 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/" className="transition-colors hover:text-brand hover:underline">
              خانه
            </Link>
            <Link href="/templates" className="transition-colors hover:text-brand hover:underline">
              قالب‌های آماده
            </Link>
            <Link
              href="/alternatives/porsline"
              className="transition-colors hover:text-brand hover:underline">
              مقایسه با پرس‌لاین
            </Link>
          </nav>
          <p>
            {APP_NAME} پروژه‌ای از{" "}
            <a
              href={SCHOOL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-700 transition-colors hover:text-brand hover:underline dark:text-slate-300">
              {SCHOOL_NAME_FA}
            </a>{" "}
            است.
          </p>
        </div>
      </footer>
    </>
  );
}
