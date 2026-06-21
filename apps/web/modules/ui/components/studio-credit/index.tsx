"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { STUDIO_URL } from "@/lib/brand-color";
import { cn } from "@/lib/cn";

interface StudioCreditProps {
  className?: string;
}

export const StudioCredit = ({ className }: Readonly<StudioCreditProps>) => {
  const { t } = useTranslation();
  const studioName = t("common.studio_name");
  const productName = t("common.studio_product_name");
  const label = t("common.studio_credit", { studio: studioName, product: productName });

  const content = <span className={cn("text-center text-xs text-slate-500", className)}>{label}</span>;

  if (!STUDIO_URL) {
    return content;
  }

  return (
    <Link
      href={STUDIO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block text-center text-xs text-slate-500 hover:text-slate-700", className)}>
      {label}
    </Link>
  );
};
