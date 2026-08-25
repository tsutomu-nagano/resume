"use client";

import type { ReactNode } from "react";
import { kind_en2ja, renderIconByKind } from "../common/convertor";

export type ThemeSummaryTable = {
  year_s?: string;
  year_e?: string;
  table_measures?: { name: string }[];
  table_dimensions?: { class_name: string }[];
  table_regions?: { regiontype: string }[];
};

export type ThemeMetadataSummary = {
  tableCount: number;
  measures: string[];
  dimensions: string[];
  regions: string[];
  years: string[];
};

export type ThemeMetadataDetail = {
  name: string;
  statname?: string;
  summary: ThemeMetadataSummary;
};

export function buildThemeMetadataSummary(
  tableCount: number,
  tables: ThemeSummaryTable[],
): ThemeMetadataSummary {
  const measures = new Set<string>();
  const dimensions = new Set<string>();
  const regions = new Set<string>();
  const years = new Set<string>();

  for (const table of tables) {
    addValues(
      measures,
      (table.table_measures || []).map((measure) => measure.name),
    );
    addValues(
      dimensions,
      (table.table_dimensions || []).map((dimension) => dimension.class_name),
    );
    addValues(
      regions,
      (table.table_regions || []).map((region) =>
        getRegionTypeLabel(region.regiontype),
      ),
    );
    addValues(years, [yearView(table.year_s, table.year_e)]);
  }

  return {
    tableCount,
    measures: sortedValues(measures),
    dimensions: sortedValues(dimensions),
    regions: sortedValues(regions),
    years: sortedValues(years),
  };
}

export function ThemeMetadataSummaryPanel({
  detail,
}: {
  detail: ThemeMetadataDetail | null;
}) {
  if (!detail) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-1 shrink-0 text-primary">
          {renderIconByKind("thema")}
        </span>
        <div className="min-w-0">
          {detail.statname ? (
            <p className="text-xs text-base-content/60">{detail.statname}</p>
          ) : null}
          <h2 className="break-words text-lg font-bold leading-7">
            {detail.name}
          </h2>
        </div>
      </div>

      <div className="grid gap-3">
        <SummaryMetric
          icon={renderIconByKind("db")}
          label="統計データ"
          value={`${detail.summary.tableCount.toLocaleString()} 件`}
        />
        <SummarySection
          icon={renderIconByKind("measure")}
          label={kind_en2ja("measure")}
          values={detail.summary.measures}
        />
        <SummarySection
          icon={renderIconByKind("dimension")}
          label={kind_en2ja("dimension")}
          values={detail.summary.dimensions}
        />
        <SummarySection
          icon={renderIconByKind("region")}
          label={kind_en2ja("region")}
          values={detail.summary.regions}
          hideWhenEmpty
        />
        <SummarySection
          icon={renderIconByKind("time")}
          label={kind_en2ja("time")}
          values={detail.summary.years}
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

export function normalizeMetadataValue(value: unknown) {
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
