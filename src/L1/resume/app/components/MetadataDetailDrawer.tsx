"use client";

import { useQuery } from "@apollo/client";
import type { ReactNode } from "react";
import { GET_MEASURE_ATTRIBUTES, GET_TABLE_THEME_DETAIL } from "@/lib/queries";
import { renderIconByKind } from "../common/convertor";
import { DimensionItemInfo } from "./DimensionItemInfo";
import { Drawer } from "./Drawer";
import { MetadataSurveyList } from "./MetadataSurveyList";
import {
  buildThemeMetadataSummary,
  ThemeMetadataSummaryPanel,
  type ThemeSummaryTable,
} from "./ThemeMetadataSummary";

type MeasureAttribute = {
  attribute: string;
  value: string;
};

interface MetadataDetailDrawerProps {
  id: string;
  kind: string;
  name: string;
  title?: ReactNode;
  attributes?: MeasureAttribute[];
  statcode?: string;
  statname?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function MetadataDetailDrawer({
  id,
  kind,
  name,
  title,
  attributes,
  statcode,
  statname,
  isOpen,
  onToggle,
}: MetadataDetailDrawerProps) {
  const drawerTitle = title || (
    <div className="flex flex-row items-center gap-2">
      {renderIconByKind(kind)}
      {name}
    </div>
  );

  if (kind === "dimension" || kind === "region") {
    return (
      <DimensionItemInfo
        id={id}
        kind={kind}
        title={drawerTitle}
        name={name}
        isOpen={isOpen}
        onToggle={onToggle}
      />
    );
  }

  return (
    <Drawer
      id={id}
      title={drawerTitle}
      isOpen={isOpen}
      onToggle={onToggle}
      sidebarContent={
        <>
          {kind === "thema" && statcode ? (
            <ThemeDetailSummary
              name={name}
              statcode={statcode}
              statname={statname}
              isOpen={isOpen}
            />
          ) : null}
          {kind === "measure" ? (
            <MeasureAttributeBadges
              name={name}
              attributes={attributes}
              isOpen={isOpen}
            />
          ) : null}
          {kind === "thema" && statcode ? null : (
            <MetadataSurveyList
              kind={kind}
              name={name}
              isOpen={isOpen}
              detailDrawerId={id}
            />
          )}
        </>
      }
    />
  );
}

function ThemeDetailSummary({
  name,
  statcode,
  statname,
  isOpen,
}: {
  name: string;
  statcode: string;
  statname?: string;
  isOpen: boolean;
}) {
  const request = GET_TABLE_THEME_DETAIL(statcode, name);
  const { data, loading, error } = useQuery(request.query, {
    variables: request.variables,
    skip: !isOpen,
  });
  const survey = data?.themeSurveys?.[0] as
    | {
        statname?: string;
        tables?: ThemeSummaryTable[];
      }
    | undefined;
  const tables = survey?.tables || [];

  if (loading) {
    return (
      <span className="loading loading-spinner text-primary">
        読み込み中です
      </span>
    );
  }

  if (error instanceof Error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <ThemeMetadataSummaryPanel
      detail={{
        name,
        statname: survey?.statname || statname,
        summary: buildThemeMetadataSummary(tables.length, tables),
      }}
    />
  );
}

export function formatMeasureAttribute(attribute: string, value: string) {
  return `${formatMeasureAttributeName(attribute)}: ${formatMeasureAttributeValue(value)}`;
}

function MeasureAttributeBadges({
  name,
  attributes,
  isOpen,
}: {
  name: string;
  attributes?: MeasureAttribute[];
  isOpen: boolean;
}) {
  const shouldFetchAttributes = isOpen && attributes === undefined;
  const request = GET_MEASURE_ATTRIBUTES(name);
  const { data, loading, error } = useQuery(request.query, {
    variables: request.variables,
    skip: !shouldFetchAttributes,
  });
  const fetchedAttributes = normalizeMeasureAttributes(
    data?.measures?.[0]?.attributes,
  );
  const visibleAttributes = normalizeMeasureAttributes(
    attributes ?? fetchedAttributes,
  );

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">集計事項の属性</h3>
      {loading ? (
        <span className="loading loading-spinner text-primary">
          読み込み中です
        </span>
      ) : error instanceof Error ? (
        <p>Error: {error.message}</p>
      ) : visibleAttributes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {visibleAttributes.map((attribute) => (
            <span
              key={`${attribute.attribute}:${attribute.value}`}
              className="badge badge-outline"
            >
              {formatMeasureAttribute(attribute.attribute, attribute.value)}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-base-content/60">
          設定されている属性はありません。
        </p>
      )}
    </section>
  );
}

function normalizeMeasureAttributes(attributes?: MeasureAttribute[]) {
  return (attributes || []).filter(
    (attribute) => attribute.attribute && attribute.value,
  );
}

function formatMeasureAttributeName(attribute: string) {
  const attributeLabels: Record<string, string> = {
    statistic: "統計量",
    basis: "基準",
    comparison: "比較基準",
    method: "推計等",
  };

  return attributeLabels[attribute] || attribute;
}

function formatMeasureAttributeValue(value: string) {
  const valueLabels: Record<string, string> = {
    mean: "平均",
    median: "中央値",
    max: "最大値",
    min: "最小値",
    ratio: "割合",
    rate: "率",
    index: "指数",
    change: "差分",
    per_person: "一人当たり",
    per_household: "一世帯当たり",
    per_establishment: "一事業所当たり",
    per_company: "一企業当たり",
    year_over_year: "前年比",
    fiscal_year_over_year: "前年度比",
    previous_period: "前期比等",
    estimated: "推計",
  };

  return valueLabels[value] || value;
}
