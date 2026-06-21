"use client";

import { TSortOption } from "@salamruby/types/surveys/types";
import { TSurveyOverviewFilters } from "@/modules/survey/list/types/survey-overview";
import { DropdownMenuItem } from "@/modules/ui/components/dropdown-menu";

interface SortOptionProps {
  option: TSortOption;
  sortBy: TSurveyOverviewFilters["sortBy"];
  handleSortChange: (option: TSortOption) => void;
}

export const SortOption = ({ option, sortBy, handleSortChange }: SortOptionProps) => {
  const isSelected = sortBy === option.value;

  return (
    <DropdownMenuItem
      key={option.label}
      className="m-0 p-0"
      onClick={() => {
        handleSortChange(option);
      }}>
      <div className="flex h-full w-full items-center gap-x-2 px-2 py-1">
        <span
          className={`size-4 shrink-0 rounded-full border ${
            isSelected
              ? "border-brand-dark bg-brand-dark outline outline-brand-dark"
              : "border-slate-300 bg-white"
          }`}
        />
        <p className="font-normal text-slate-700">{option.label}</p>
      </div>
    </DropdownMenuItem>
  );
};
