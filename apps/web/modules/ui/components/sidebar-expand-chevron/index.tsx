"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface SidebarExpandChevronProps {
  isRtl: boolean;
  className?: string;
}

export const SidebarExpandChevron = ({ isRtl, className }: Readonly<SidebarExpandChevronProps>) => {
  const Icon = isRtl ? ChevronLeftIcon : ChevronRightIcon;
  return <Icon className={cn("size-4 shrink-0 text-slate-600", className)} strokeWidth={1.5} />;
};
