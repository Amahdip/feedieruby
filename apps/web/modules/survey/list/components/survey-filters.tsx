"use client";

import { TFunction } from "i18next";
import { ChevronDownIcon, X } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFilterOption, TSortOption } from "@salamruby/types/surveys/types";
import { TWorkspaceConfigChannel } from "@salamruby/types/workspace";
import { SortOption } from "@/modules/survey/list/components/sort-option";
import { initialFilters } from "@/modules/survey/list/lib/constants";
import { TSurveyOverviewFilters } from "@/modules/survey/list/types/survey-overview";
import { Button } from "@/modules/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/modules/ui/components/dropdown-menu";
import { SearchBar } from "@/modules/ui/components/search-bar";
import { SurveyFilterDropdown } from "./survey-filter-dropdown";

interface SurveyFilterProps {
  surveyFilters: TSurveyOverviewFilters;
  setSurveyFilters: Dispatch<SetStateAction<TSurveyOverviewFilters>>;
  currentWorkspaceChannel: TWorkspaceConfigChannel;
}

const getStatusOptions = (t: TFunction): TFilterOption[] => [
  { label: t("common.draft"), value: "draft" },
  { label: t("common.in_progress"), value: "inProgress" },
  { label: t("common.paused"), value: "paused" },
  { label: t("common.completed"), value: "completed" },
];

const getSortOptions = (t: TFunction): TSortOption[] => [
  {
    label: t("common.updated_at"),
    value: "updatedAt",
  },
  {
    label: t("common.created_at"),
    value: "createdAt",
  },
  {
    label: t("workspace.surveys.alphabetical"),
    value: "name",
  },
  {
    label: t("workspace.surveys.relevance"),
    value: "relevance",
  },
];

export const SurveyFilters = ({
  surveyFilters,
  setSurveyFilters,
  currentWorkspaceChannel,
}: SurveyFilterProps) => {
  const { sortBy, status, type } = surveyFilters;
  const [name, setName] = useState(surveyFilters.name);
  const { t } = useTranslation();

  useEffect(() => {
    const timeoutId = setTimeout(() => setSurveyFilters((prev) => ({ ...prev, name })), 800);

    return () => clearTimeout(timeoutId);
  }, [name, setSurveyFilters]);

  const [dropdownOpenStates, setDropdownOpenStates] = useState(new Map());

  const typeOptions: TFilterOption[] = [
    { label: t("common.link"), value: "link" },
    { label: t("common.app"), value: "app" },
  ];

  useEffect(() => {
    setName(surveyFilters.name);
  }, [surveyFilters.name]);

  const toggleDropdown = (id: string) => {
    setDropdownOpenStates(new Map(dropdownOpenStates).set(id, !dropdownOpenStates.get(id)));
  };

  const handleStatusChange = (value: string) => {
    if (value === "inProgress" || value === "paused" || value === "completed" || value === "draft") {
      if (status.includes(value)) {
        setSurveyFilters((prev) => ({ ...prev, status: prev.status.filter((v) => v !== value) }));
      } else {
        setSurveyFilters((prev) => ({ ...prev, status: [...prev.status, value] }));
      }
    }
  };

  const handleTypeChange = (value: string) => {
    if (value === "link" || value === "app") {
      if (type.includes(value)) {
        setSurveyFilters((prev) => ({ ...prev, type: prev.type.filter((v) => v !== value) }));
      } else {
        setSurveyFilters((prev) => ({ ...prev, type: [...prev.type, value] }));
      }
    }
  };

  const handleSortChange = (option: TSortOption) => {
    setSurveyFilters((prev) => ({ ...prev, sortBy: option.value }));
  };

  return (
    <div className="flex justify-between">
      <div className="flex gap-x-2">
        <SearchBar
          value={name}
          onChange={setName}
          placeholder={t("workspace.surveys.search_by_survey_name")}
          className="border-slate-300"
        />
        <div>
          <SurveyFilterDropdown
            title={t("common.status")}
            id="status"
            options={getStatusOptions(t)}
            selectedOptions={status}
            setSelectedOptions={handleStatusChange}
            isOpen={dropdownOpenStates.get("status")}
            toggleDropdown={toggleDropdown}
          />
        </div>
        {currentWorkspaceChannel !== "link" && (
          <div>
            <SurveyFilterDropdown
              title={t("common.type")}
              id="type"
              options={typeOptions}
              selectedOptions={type}
              setSelectedOptions={handleTypeChange}
              isOpen={dropdownOpenStates.get("type")}
              toggleDropdown={toggleDropdown}
            />
          </div>
        )}

        {(status.length > 0 || type.length > 0 || name) && (
          <Button
            size="sm"
            onClick={() => {
              setSurveyFilters(initialFilters);
              setName(initialFilters.name);
            }}
            className="h-8">
            {t("common.clear_filters")}
            <X />
          </Button>
        )}
      </div>
      <div className="flex gap-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="surveyFilterDropdown h-full cursor-pointer border border-slate-300 bg-white outline-none hover:bg-slate-50">
            <div className="min-w-auto hidden h-8 rounded-md sm:flex sm:items-center sm:gap-2 sm:px-2">
              <span className="text-sm text-slate-700">
                {t("common.sort_by")}:{" "}
                {getSortOptions(t).find((option) => option.value === sortBy)
                  ? getSortOptions(t).find((option) => option.value === sortBy)?.label
                  : ""}
              </span>
              <ChevronDownIcon className="size-4 shrink-0 text-slate-500" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {getSortOptions(t).map((option) => (
              <SortOption
                option={option}
                key={option.value}
                sortBy={surveyFilters.sortBy}
                handleSortChange={handleSortChange}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
