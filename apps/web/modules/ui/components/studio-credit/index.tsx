"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { APP_URL, STUDIO_URL } from "@/lib/brand-color";
import { cn } from "@/lib/cn";
import { useRtl } from "@/lib/i18n/use-rtl";

interface StudioCreditProps {
  className?: string;
}

export const StudioCredit = ({ className }: Readonly<StudioCreditProps>) => {
  const { t } = useTranslation();
  const isRtl = useRtl();
  const studioName = t("common.studio_name");
  const productName = t("common.studio_product_name");
  const lead = t("common.studio_credit_lead");
  const tail = t("common.studio_credit_tail");

  const wrapperClassName = "flex w-full justify-center px-2";

  return (
    <div className={wrapperClassName} dir={isRtl ? "rtl" : "ltr"}>
      <span
        className={cn(
          "inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-0.5 rounded-full border border-slate-200/90 bg-slate-50/90 px-3.5 py-1.5 text-center text-xs shadow-sm",
          className
        )}>
        {APP_URL ? (
          <Link
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-rose-800 hover:underline">
            {productName}
          </Link>
        ) : (
          <span className="font-semibold text-rose-800">{productName}</span>
        )}
        <span aria-hidden className="text-slate-300">
          ·
        </span>
        {STUDIO_URL ? (
          <Link
            href={STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:underline">
            {lead}
            {lead ? " " : ""}
            <span className="font-medium text-slate-700">{studioName}</span>
            {tail ? ` ${tail}` : ""}
          </Link>
        ) : (
          <span className="text-slate-500">
            {lead}
            {lead ? " " : ""}
            <span className="font-medium text-slate-700">{studioName}</span>
            {tail ? ` ${tail}` : ""}
          </span>
        )}
      </span>
    </div>
  );
};
