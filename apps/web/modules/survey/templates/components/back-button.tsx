"use client";

import { GoBackButton } from "@/modules/ui/components/go-back-button";

interface BackButtonProps {
  path?: string;
}

export const BackButton = ({ path }: Readonly<BackButtonProps>) => {
  return <GoBackButton url={path} align="none" />;
};
