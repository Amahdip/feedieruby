"use client";

import { ChevronDownIcon } from "lucide-react";
import { TFilterOption } from "@salamruby/types/surveys/types";
import { Checkbox } from "@/modules/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/modules/ui/components/dropdown-menu";

interface SurveyFilterDropdownProps {
  title: string;
  id: "status" | "type";
  options: TFilterOption[];
  selectedOptions: string[];
  setSelectedOptions: (value: string) => void;
  isOpen: boolean;
  toggleDropdown: (id: string) => void;
}

export const SurveyFilterDropdown = ({
  title,
  id,
  options,
  selectedOptions,
  setSelectedOptions,
  isOpen,
  toggleDropdown,
}: SurveyFilterDropdownProps) => {
  const hasSelection = selectedOptions.length > 0;
  const triggerClasses = `surveyFilterDropdown min-w-auto h-8 rounded-md border sm:px-2 cursor-pointer outline-none ${
    hasSelection
      ? "border-brand-dark bg-slate-50 text-slate-900"
      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
  }`;

  return (
    <DropdownMenu open={isOpen} onOpenChange={() => toggleDropdown(id)}>
      <DropdownMenuTrigger asChild className={triggerClasses}>
        <div className="flex items-center gap-2">
          <span className="text-sm">{title}</span>
          <ChevronDownIcon className="size-4 shrink-0 text-slate-500" strokeWidth={1.5} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((option) => {
          const isChecked = selectedOptions.includes(option.value);

          return (
            <DropdownMenuItem
              key={option.value}
              className="m-0 p-0"
              onClick={(e) => {
                e.preventDefault();
                setSelectedOptions(option.value);
              }}>
              <div className="flex h-full w-full items-center gap-x-2 px-2 py-1">
                <Checkbox
                  checked={isChecked}
                  className={isChecked ? "border-none bg-brand-dark text-white" : "bg-white"}
                />
                <p className="font-normal text-slate-700">{option.label}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
