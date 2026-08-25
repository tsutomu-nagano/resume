"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { renderIconByKind } from "../common/convertor";
import { Drawer } from "./Drawer";
import {
  buildThemeMetadataSummary,
  normalizeMetadataValue,
  ThemeMetadataSummaryPanel,
} from "./ThemeMetadataSummary";

export type TableThemeSurveyResult = {
  metadataId: string;
  kind: "themeSurvey";
  statcode: string;
  statname: string;
  table_count?: {
    aggregate?: {
      count?: number;
    } | null;
  } | null;
  tables?: {
    year_s?: string;
    year_e?: string;
    table_tags?: { tag_name: string }[];
    table_measures?: { name: string }[];
    table_dimensions?: { class_name: string }[];
    table_regions?: { regiontype: string }[];
  }[];
};

type TableThemeNode = {
  id: string;
  name: string;
  statcode: string;
  statname: string;
  tableCount: number;
  tables: NonNullable<TableThemeSurveyResult["tables"]>;
  measures: string[];
  dimensions: string[];
  regions: string[];
  years: string[];
};

type TableExplorerProps = {
  surveys: TableThemeSurveyResult[];
};

export function TableExplorer({ surveys }: TableExplorerProps) {
  const [selectedTheme, setSelectedTheme] = useState<TableThemeNode | null>(
    null,
  );
  const isDetailDrawerOpen = Boolean(selectedTheme);
  const closeDetailDrawer = () => setSelectedTheme(null);

  if (surveys.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-base-300 bg-base-100 p-4 text-sm text-base-content/60">
        該当する提供分類はありません。
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {surveys.map((survey) => (
          <SurveyThemeGroup
            key={survey.metadataId}
            survey={survey}
            selectedThemeId={selectedTheme?.id ?? null}
            onSelectTheme={setSelectedTheme}
          />
        ))}
      </div>
      <Drawer
        id="table-theme-detail"
        title={
          <span className="flex min-w-0 items-center gap-2">
            {renderIconByKind("thema")}
            <span className="truncate">提供分類の詳細</span>
          </span>
        }
        isOpen={isDetailDrawerOpen}
        onToggle={closeDetailDrawer}
        sidebarContent={
          <ThemeMetadataSummaryPanel
            detail={
              selectedTheme
                ? {
                    name: selectedTheme.name,
                    statname: selectedTheme.statname,
                    summary: buildThemeMetadataSummary(
                      selectedTheme.tableCount,
                      selectedTheme.tables,
                    ),
                  }
                : null
            }
          />
        }
      />
    </>
  );
}

function SurveyThemeGroup({
  survey,
  selectedThemeId,
  onSelectTheme,
}: {
  survey: TableThemeSurveyResult;
  selectedThemeId: string | null;
  onSelectTheme: (theme: TableThemeNode) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const themes = useMemo(() => buildThemeNodes(survey), [survey]);
  const tableCount = getSurveyTableCount(survey);

  return (
    <section className="rounded-md border border-base-300 bg-base-100 shadow-sm">
      <button
        type="button"
        className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-base-200"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? (
          <ChevronDown className="size-4 shrink-0" />
        ) : (
          <ChevronRight className="size-4 shrink-0" />
        )}
        <span className="shrink-0 text-primary">
          {renderIconByKind("stat")}
        </span>
        <span className="min-w-0 flex-1 truncate font-semibold">
          {survey.statname}
        </span>
        <span className="badge badge-outline shrink-0">
          {tableCount.toLocaleString()}
        </span>
      </button>

      <div
        className={`grid transition-all duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 border-t border-base-300 p-3">
            {themes.length > 0 ? (
              themes.map((theme) => {
                const isSelected = selectedThemeId === theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-md border bg-base-100 p-3 text-left transition hover:bg-base-200 ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-base-300"
                    }`}
                    aria-pressed={isSelected}
                    onClick={() => onSelectTheme(theme)}
                  >
                    <span className="shrink-0 text-primary">
                      {renderIconByKind("thema")}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {theme.name}
                    </span>
                    <span className="badge badge-outline shrink-0">
                      {theme.tableCount.toLocaleString()}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-base-content/60">
                提供分類なしの統計データです。
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function buildThemeNodes(survey: TableThemeSurveyResult): TableThemeNode[] {
  const summaries = new Map<
    string,
    {
      tableCount: number;
      tables: NonNullable<TableThemeSurveyResult["tables"]>;
      measures: Set<string>;
      dimensions: Set<string>;
      regions: Set<string>;
      years: Set<string>;
    }
  >();

  for (const table of survey.tables || []) {
    const tagNames = new Set(
      (table.table_tags || [])
        .map((tag) => normalizeMetadataValue(tag.tag_name))
        .filter(Boolean),
    );

    for (const tagName of tagNames) {
      const summary =
        summaries.get(tagName) || createEmptyThemeMetadataSummary();

      summary.tableCount += 1;
      summary.tables.push(table);
      addValues(
        summary.measures,
        (table.table_measures || []).map((measure) => measure.name),
      );
      addValues(
        summary.dimensions,
        (table.table_dimensions || []).map((dimension) => dimension.class_name),
      );
      addValues(
        summary.regions,
        (table.table_regions || []).map((region) =>
          getRegionTypeLabel(region.regiontype),
        ),
      );
      addValues(summary.years, [yearView(table.year_s, table.year_e)]);
      summaries.set(tagName, summary);
    }
  }

  return Array.from(summaries.entries())
    .sort(([left], [right]) => compareJapaneseText(left, right))
    .map(([name, summary]) => ({
      id: `${survey.statcode}:${name}`,
      name,
      statcode: survey.statcode,
      statname: survey.statname,
      tableCount: summary.tableCount,
      tables: summary.tables,
      measures: sortedValues(summary.measures),
      dimensions: sortedValues(summary.dimensions),
      regions: sortedValues(summary.regions),
      years: sortedValues(summary.years),
    }));
}

function createEmptyThemeMetadataSummary() {
  return {
    tableCount: 0,
    tables: [],
    measures: new Set<string>(),
    dimensions: new Set<string>(),
    regions: new Set<string>(),
    years: new Set<string>(),
  };
}

function addValues(target: Set<string>, values: unknown[]) {
  for (const value of values) {
    const normalizedValue = normalizeMetadataValue(value);

    if (normalizedValue) {
      target.add(normalizedValue);
    }
  }
}

function sortedValues(values: Set<string>) {
  return Array.from(values).sort(compareJapaneseText);
}

function compareJapaneseText(left: unknown, right: unknown) {
  return String(left).localeCompare(String(right), "ja");
}

function yearView(yearStart?: string, yearEnd?: string) {
  if (!yearStart && !yearEnd) {
    return "";
  }

  if (yearStart === yearEnd) {
    return yearStart === "0" ? "-" : yearStart || "";
  }

  return `${yearStart || "-"} - ${yearEnd || "-"}`;
}

function getRegionTypeLabel(regionType: unknown) {
  const regionLabel = new Map<string, string>([
    ["ken", "都道府県"],
    ["city", "市区町村"],
  ]);
  const normalizedRegionType = normalizeMetadataValue(regionType);

  return regionLabel.get(normalizedRegionType) || "";
}

function getSurveyTableCount(survey: TableThemeSurveyResult) {
  return Number(survey.table_count?.aggregate?.count ?? 0);
}
