"use client";

import { useQuery } from "@apollo/client";
import { BarChart3, Check, Scale, X } from "lucide-react";
import { BiAward } from "react-icons/bi";
import { RiLoopLeftFill } from "react-icons/ri";
import { TbTable, TbTargetArrow } from "react-icons/tb";
import { kind_en2ja, renderIconByKind } from "../common/convertor";
import {
  GET_SURVEY_COMPARISON_LIST,
  GET_SURVEY_ATTRIBUTES,
  type SurveyAttribute,
} from "@/lib/queries";
import {
  isSurveyResult,
  toSurveyCardProps,
  type SurveyResult,
} from "@/lib/surveyResults";
import { DiscontinuedBadge } from "./DiscontinudBadge";
import { buildThemeMetadataSummary } from "./ThemeMetadataSummary";

interface SurveyComparisonTableProps {
  selectedSurveyNames: string[];
  onRemoveSurvey: (surveyName: string) => void;
}

type ComparisonRow = {
  label: string;
  icon: JSX.Element;
  render: (survey: SurveyResult) => JSX.Element | string;
};

function getAttributeValues(attributes: SurveyAttribute[] = [], code: string) {
  return attributes
    .filter((attribute) => attribute.attribute.code === code)
    .map((attribute) => attribute.value)
    .filter(Boolean);
}

function getFirstAttributeValue(
  attributes: SurveyAttribute[] = [],
  code: string,
) {
  return getAttributeValues(attributes, code)[0] || "";
}

const comparisonRows: ComparisonRow[] = [
  {
    label: "作成機関",
    icon: <BarChart3 className="size-4" />,
    render: (survey) => survey.govlist.govname,
  },
  {
    label: "統計の種類",
    icon: <BiAward />,
    render: (survey) =>
      getFirstAttributeValue(survey.attributes, "stat_kind") || "-",
  },
  {
    label: "調査対象",
    icon: <TbTargetArrow />,
    render: (survey) => {
      const values = getAttributeValues(survey.attributes, "survey_units");

      return values.length ? (
        <div className="flex flex-wrap gap-1">
          {values.map((value) => (
            <span key={value} className="badge badge-outline badge-sm">
              {value}
            </span>
          ))}
        </div>
      ) : (
        "-"
      );
    },
  },
  {
    label: "調査周期",
    icon: <RiLoopLeftFill />,
    render: (survey) => {
      const values = getAttributeValues(survey.attributes, "survey_cycle");

      return values.length ? values.join("、") : "-";
    },
  },
  {
    label: "統計表数",
    icon: <TbTable />,
    render: (survey) => `${toSurveyCardProps(survey).tableCount} 件`,
  },
  {
    label: "提供状況",
    icon: <Check className="size-4" />,
    render: (survey) =>
      toSurveyCardProps(survey).isDiscontinued ? (
        <DiscontinuedBadge />
      ) : (
        "提供中"
      ),
  },
  {
    label: "概要",
    icon: <Scale className="size-4" />,
    render: (survey) =>
      getFirstAttributeValue(survey.attributes, "description") || "-",
  },
  {
    label: kind_en2ja("measure"),
    icon: renderIconByKind("measure"),
    render: (survey) => (
      <MetadataSummaryValues
        values={getSurveyMetadataSummary(survey).measures}
      />
    ),
  },
  {
    label: kind_en2ja("dimension"),
    icon: renderIconByKind("dimension"),
    render: (survey) => (
      <MetadataSummaryValues
        values={getSurveyMetadataSummary(survey).dimensions}
      />
    ),
  },
  {
    label: kind_en2ja("region"),
    icon: renderIconByKind("region"),
    render: (survey) => (
      <MetadataSummaryValues
        values={getSurveyMetadataSummary(survey).regions}
      />
    ),
  },
  {
    label: kind_en2ja("time"),
    icon: renderIconByKind("time"),
    render: (survey) => (
      <MetadataSummaryValues
        values={getSurveyMetadataSummary(survey).years}
        maxVisible={6}
      />
    ),
  },
];

function getSurveyMetadataSummary(survey: SurveyResult) {
  return buildThemeMetadataSummary(
    Number(survey.table_count?.aggregate?.count ?? 0),
    survey.tables || [],
  );
}

function MetadataSummaryValues({
  values,
  maxVisible = 8,
}: {
  values: string[];
  maxVisible?: number;
}) {
  const visibleValues = values.slice(0, maxVisible);
  const hiddenCount = values.length - visibleValues.length;

  return visibleValues.length > 0 ? (
    <div className="flex flex-wrap gap-1.5">
      {visibleValues.map((value) => (
        <span
          key={value}
          className="badge badge-ghost badge-sm max-w-full truncate"
          title={value}
        >
          {value}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span className="badge badge-outline badge-sm">+{hiddenCount}</span>
      ) : null}
    </div>
  ) : (
    <span className="text-base-content/60">該当なし</span>
  );
}

export function SurveyComparisonTable({
  selectedSurveyNames,
  onRemoveSurvey,
}: SurveyComparisonTableProps) {
  const comparisonRequest = GET_SURVEY_COMPARISON_LIST(selectedSurveyNames);
  const { data, loading, error } = useQuery(comparisonRequest.query, {
    variables: comparisonRequest.variables,
    skip: selectedSurveyNames.length === 0,
  });
  const surveyRows = ((data?.surveylist || []) as unknown[]).filter(
    isSurveyResult,
  );
  const statcodes = surveyRows.map((survey) => survey.statcode);
  const attributeRequest = GET_SURVEY_ATTRIBUTES(statcodes);
  const {
    data: attributeData,
    loading: attributesLoading,
    error: attributesError,
  } = useQuery(attributeRequest.query, {
    variables: attributeRequest.variables,
    skip: statcodes.length === 0,
  });
  const attributesByStatcode = new Map<string, SurveyAttribute[]>();

  for (const attribute of (attributeData?.attributes ||
    []) as SurveyAttribute[]) {
    const currentAttributes =
      attributesByStatcode.get(attribute.statcode) || [];
    currentAttributes.push(attribute);
    attributesByStatcode.set(attribute.statcode, currentAttributes);
  }

  const surveys = surveyRows.map((survey) => ({
    ...survey,
    attributes: attributesByStatcode.get(survey.statcode) || [],
  }));

  if (selectedSurveyNames.length === 0) {
    return null;
  }

  return (
    <section className="rounded-md border border-base-300 bg-base-100 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Scale className="size-5 text-primary" />
          <h2 className="text-base font-bold">選択中の統計調査を比較</h2>
          <span className="badge badge-primary badge-sm">
            {selectedSurveyNames.length}
          </span>
        </div>
        <p className="text-sm text-base-content/60">
          横にスクロールして項目ごとの差を確認できます
        </p>
      </div>

      {loading || attributesLoading ? (
        <div className="flex items-center gap-2 p-4 text-sm text-base-content/60">
          <span className="loading loading-spinner loading-sm" />
          比較情報を読み込み中です
        </div>
      ) : error instanceof Error || attributesError instanceof Error ? (
        <p className="p-4 text-sm text-error">
          比較情報の取得に失敗しました。
          {(error as Error | undefined)?.message ||
            (attributesError as Error | undefined)?.message}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-pin-rows table-pin-cols min-w-[760px]">
            <thead>
              <tr>
                <th className="w-40 bg-base-200">比較項目</th>
                {surveys.map((survey) => (
                  <th key={survey.statcode} className="min-w-64 align-top">
                    <div className="flex min-h-24 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm leading-5">
                          {survey.statname}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs btn-square shrink-0"
                          aria-label={`${survey.statname}を比較から外す`}
                          title="比較から外す"
                          onClick={() => onRemoveSurvey(survey.statname)}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <span className="text-xs font-normal text-base-content/60">
                        {survey.statcode}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <th className="bg-base-200 align-top">
                    <span className="flex items-center gap-2">
                      {row.icon}
                      {row.label}
                    </span>
                  </th>
                  {surveys.map((survey) => (
                    <td
                      key={`${survey.statcode}:${row.label}`}
                      className="max-w-80 whitespace-normal align-top text-sm leading-6"
                    >
                      {row.render(survey)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
