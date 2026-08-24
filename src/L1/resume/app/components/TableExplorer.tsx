"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { kind_en2ja, renderIconByKind } from "../common/convertor";
import { Drawer } from "./Drawer";

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
  measures: string[];
  dimensions: string[];
  regions: string[];
  years: string[];
};

type MetadataSummary = {
  tableCount: number;
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
  const selectedSummary = useMemo(
    () => (selectedTheme ? buildMetadataSummary(selectedTheme) : null),
    [selectedTheme],
  );
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
          <MetadataSummaryPanel theme={selectedTheme} summary={selectedSummary} />
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
        <span className="shrink-0 text-primary">{renderIconByKind("stat")}</span>
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
      addValues(
        summary.measures,
        (table.table_measures || []).map((measure) => measure.name),
      );
      addValues(
        summary.dimensions,
        (table.table_dimensions || []).map(
          (dimension) => dimension.class_name,
        ),
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
      measures: sortedValues(summary.measures),
      dimensions: sortedValues(summary.dimensions),
      regions: sortedValues(summary.regions),
      years: sortedValues(summary.years),
    }));
}

function buildMetadataSummary(theme: TableThemeNode): MetadataSummary {
  return {
    tableCount: theme.tableCount,
    measures: theme.measures,
    dimensions: theme.dimensions,
    regions: theme.regions,
    years: theme.years,
  };
}

function createEmptyThemeMetadataSummary() {
  return {
    tableCount: 0,
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

function normalizeMetadataValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
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

function MetadataSummaryPanel({
  theme,
  summary,
}: {
  theme: TableThemeNode | null;
  summary: MetadataSummary | null;
}) {
  if (!theme || !summary) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-1 shrink-0 text-primary">
          {renderIconByKind("thema")}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-base-content/60">{theme.statname}</p>
          <h2 className="break-words text-lg font-bold leading-7">
            {theme.name}
          </h2>
        </div>
      </div>

      <div className="grid gap-3">
        <SummaryMetric
          icon={renderIconByKind("db")}
          label="統計データ"
          value={`${summary.tableCount.toLocaleString()} 件`}
        />
        <SummarySection
          icon={renderIconByKind("measure")}
          label={kind_en2ja("measure")}
          values={summary.measures}
        />
        <SummarySection
          icon={renderIconByKind("dimension")}
          label={kind_en2ja("dimension")}
          values={summary.dimensions}
        />
        <SummarySection
          icon={renderIconByKind("region")}
          label={kind_en2ja("region")}
          values={summary.regions}
          hideWhenEmpty
        />
        <SummarySection
          icon={renderIconByKind("time")}
          label={kind_en2ja("time")}
          values={summary.years}
          maxVisible={6}
        />
      </div>
    </div>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-base-300 bg-base-200/60 px-3 py-2 text-sm">
      <span className="inline-flex items-center gap-2 text-base-content/70">
        {icon}
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function SummarySection({
  icon,
  label,
  values,
  maxVisible = 8,
  hideWhenEmpty = false,
}: {
  icon: ReactNode;
  label: string;
  values: string[];
  maxVisible?: number;
  hideWhenEmpty?: boolean;
}) {
  const visibleValues = values.slice(0, maxVisible);
  const hiddenCount = values.length - visibleValues.length;

  if (hideWhenEmpty && values.length === 0) {
    return null;
  }

  return (
    <section className="rounded border border-base-300 p-3">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {label}
        <span className="badge badge-outline badge-sm">{values.length}</span>
      </h3>
      {visibleValues.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {visibleValues.map((value) => (
            <span
              key={value}
              className="badge badge-ghost max-w-full truncate"
              title={value}
            >
              {value}
            </span>
          ))}
          {hiddenCount > 0 ? (
            <span className="badge badge-outline">+{hiddenCount}</span>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-base-content/60">該当なし</p>
      )}
    </section>
  );
}
