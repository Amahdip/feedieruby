"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { isRtlLocale } from "@/lib/i18n/rtl";
import { Button } from "@/modules/ui/components/button";

interface GoBackButtonProps {
  url?: string;
  onClick?: () => void;
  className?: string;
  /** When "none", renders only the button (for inline toolbars). Default wraps with alignment. */
  align?: "start" | "end" | "none";
}

export const GoBackButton = ({ url, onClick, className, align = "start" }: Readonly<GoBackButtonProps>) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRtl = isRtlLocale(i18n.resolvedLanguage ?? i18n.language);
  const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (url) {
      router.push(url);
      return;
    }

    router.back();
  };

  const button = (
    <Button
      size="sm"
      variant="secondary"
      className={cn("gap-1.5", isRtl && "flex-row-reverse", className)}
      onClick={handleClick}>
      {t("common.back")}
      <BackIcon className="size-4 shrink-0" />
    </Button>
  );

  if (align === "none") {
    return button;
  }

  return (
    <div className={cn("flex w-full", align === "end" || isRtl ? "justify-end" : "justify-start")}>
      {button}
    </div>
  );
};
