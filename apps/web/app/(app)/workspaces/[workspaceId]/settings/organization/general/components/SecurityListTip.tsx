"use client";

import { ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { HIDE_SALAMRUBY_EXTERNAL_LINKS } from "@/lib/brand-color";

export const SecurityListTip = () => {
  const { t } = useTranslation();

  if (HIDE_SALAMRUBY_EXTERNAL_LINKS) {
    return null;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-x-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 shadow-sm">
        <ShieldCheckIcon className="size-5 flex-shrink-0 text-blue-400" />
        <p className="text-sm">
          {t("workspace.settings.general.security_list_tip")}{" "}
          <Link
            href="https://salamruby.com/security#stay-informed-with-salamruby-security-updates"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-700">
            {t("workspace.settings.general.security_list_tip_link")}
          </Link>
        </p>
      </div>
    </div>
  );
};
