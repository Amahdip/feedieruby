"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { createId } from "@paralleldrive/cuid2";
import * as Collapsible from "@radix-ui/react-collapsible";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Workspace } from "@salamruby/database/prisma-browser";
import { cn } from "@/lib/cn";
import {
  getCXElementTypes,
  getElementDefaults,
  getElementTypes,
  universalElementPresets,
} from "@/modules/survey/lib/elements";

interface AddElementButtonProps {
  addElement: (element: any) => void;
  workspace: Workspace;
  isCxMode: boolean;
}

export const AddElementButton = ({ addElement, workspace, isCxMode }: AddElementButtonProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const availableElementTypes = isCxMode ? getCXElementTypes(t) : getElementTypes(t);
  const [parent] = useAutoAnimate();

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className={cn(
        open ? "shadow-lg" : "shadow-md",
        "group w-full space-y-2 rounded-lg border border-slate-300 bg-white duration-200 hover:cursor-pointer hover:bg-slate-50"
      )}>
      <Collapsible.CollapsibleTrigger asChild className="group h-full w-full">
        <div className="flex w-full">
          <div className="flex w-10 shrink-0 items-center justify-center rounded-s-lg bg-brand-dark group-aria-expanded:rounded-es-none">
            <PlusIcon className="size-5 text-white" />
          </div>
          <div className="flex-1 px-4 py-3 text-start">
            <p className="text-sm font-semibold">{t("workspace.surveys.edit.add_block")}</p>
            <p className="mt-1 text-xs text-slate-500">
              {t("workspace.surveys.edit.choose_the_first_question_on_your_block")}
            </p>
          </div>
        </div>
      </Collapsible.CollapsibleTrigger>
      <Collapsible.CollapsibleContent className="flex flex-col gap-0.5 px-2 pb-2" ref={parent}>
        {availableElementTypes.map((elementType) => (
          <button
            type="button"
            key={elementType.id}
            className="w-full rounded px-2 py-2 text-start hover:bg-slate-100"
            onClick={() => {
              addElement({
                ...universalElementPresets,
                ...getElementDefaults(elementType.id, workspace, t),
                id: createId(),
                type: elementType.id,
              });
              setOpen(false);
            }}
            onMouseEnter={() => setHoveredElementId(elementType.id)}
            onMouseLeave={() => setHoveredElementId(null)}>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-800">
              <elementType.icon className="size-4 shrink-0 text-brand-dark" aria-hidden="true" />
              <span>{elementType.label}</span>
            </div>
            {hoveredElementId === elementType.id && (
              <p className="mt-1 ps-6 text-xs font-light leading-snug text-slate-500">
                {elementType.description}
              </p>
            )}
          </button>
        ))}
      </Collapsible.CollapsibleContent>
    </Collapsible.Root>
  );
};
