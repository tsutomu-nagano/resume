"use client";

import { useQuery } from "@apollo/client";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BiAward } from "react-icons/bi";
import { FiInfo, FiX } from "react-icons/fi";
import { LuClipboardList } from "react-icons/lu";
import { RiLoopLeftFill } from "react-icons/ri";
import { GET_METADATA_SURVEYS, GET_SURVEY_ATTRIBUTES } from "@/lib/queries";
import type { SurveyAttribute } from "@/lib/queries";
import { SurveyUnitIcon } from "@/lib/surveyUnitIcons";
import { DiscontinuedBadge } from "./DiscontinudBadge";

interface MetadataSurveyListProps {
  kind: string;
  name: string;
  isOpen: boolean;
  detailDrawerId?: string;
}

type MetadataSurvey = {
  statcode: string;
  statname: string;
  govname?: string;
  tableCount?: number;
  isDiscontinued?: boolean;
};

type MetadataSurveyValue = {
  statcode: string;
  survey?: {
    statname?: string;
    govlist?: {
      govname?: string;
    } | null;
    table_count?: {
      aggregate?: {
        count?: number;
      } | null;
    } | null;
    discontinuedSurvey?: {
      statcode?: string | null;
    } | null;
  } | null;
};

type MetadataSurveyRow = {
  statcode: string;
  statname: string;
  govlist?: {
    govname?: string;
  } | null;
  table_count?: {
    aggregate?: {
      count?: number;
    } | null;
  } | null;
  discontinuedSurvey?: {
    statcode?: string | null;
  } | null;
};

export function MetadataSurveyList({
  kind,
  name,
  isOpen,
  detailDrawerId,
}: MetadataSurveyListProps) {
  const [selectedSurvey, setSelectedSurvey] = useState<MetadataSurvey | null>(
    null,
  );
  const surveyRequest = GET_METADATA_SURVEYS(kind, name);
  const { data, loading, error, refetch } = useQuery(surveyRequest.query, {
    variables: surveyRequest.variables,
    skip: !isOpen,
  });
  const surveys = getUniqueSurveys(getMetadataSurveys(data));

  useEffect(() => {
    if (isOpen) {
      refetch();
    } else {
      setSelectedSurvey(null);
    }
  }, [isOpen, refetch]);

  return (
    <>
      <div className="divider divider-start divider-primary text-xl">
        使用している統計調査
      </div>
      {loading ? (
        <span className="loading loading-spinner text-primary">
          読み込み中です
        </span>
      ) : error instanceof Error ? (
        <p>Error: {error.message}</p>
      ) : surveys.length ? (
        <div className="flex flex-col gap-2">
          {surveys.map((survey) => (
            <div
              key={survey.statcode}
              className="flex items-start gap-3 rounded border border-base-300 bg-base-100 p-3"
            >
              <LuClipboardList className="mt-1 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-medium leading-6">{survey.statname}</span>
                <span className="text-xs text-base-content/60">
                  {survey.statcode}
                </span>
                {survey.govname ? (
                  <span className="text-xs text-base-content/60">
                    {survey.govname}
                  </span>
                ) : null}
                {survey.isDiscontinued ? (
                  <DiscontinuedBadge />
                ) : null}
              </div>
              <button
                type="button"
                className="btn btn-outline btn-primary btn-sm shrink-0 gap-2"
                onClick={() => setSelectedSurvey(survey)}
              >
                <FiInfo />
                詳細
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>該当する統計調査はありません。</p>
      )}
      {selectedSurvey ? (
        <SurveyDetailSideDrawer
          survey={selectedSurvey}
          detailDrawerId={detailDrawerId}
          onClose={() => setSelectedSurvey(null)}
        />
      ) : null}
    </>
  );
}

function getUniqueSurveys(surveys: MetadataSurvey[]) {
  const uniqueSurveys = new Map<string, MetadataSurvey>();

  surveys.forEach((survey) => {
    uniqueSurveys.set(survey.statcode, survey);
  });

  return Array.from(uniqueSurveys.values()).sort((left, right) =>
    left.statname.localeCompare(right.statname, "ja"),
  );
}

function getMetadataSurveys(data: unknown): MetadataSurvey[] {
  const result = data as
    | {
        surveys?: MetadataSurveyRow[];
        surveyValues?: MetadataSurveyValue[];
      }
    | undefined;

  if (result?.surveys) {
    return result.surveys.map((survey) => ({
      statcode: survey.statcode,
      statname: survey.statname,
      govname: survey.govlist?.govname,
      tableCount: Number(survey.table_count?.aggregate?.count ?? 0),
      isDiscontinued: Boolean(survey.discontinuedSurvey),
    }));
  }

  return (result?.surveyValues || []).map((item) => ({
    statcode: item.statcode,
    statname: item.survey?.statname || item.statcode,
    govname: item.survey?.govlist?.govname,
    tableCount: Number(item.survey?.table_count?.aggregate?.count ?? 0),
    isDiscontinued: Boolean(item.survey?.discontinuedSurvey),
  }));
}

function SurveyDetailSideDrawer({
  survey,
  detailDrawerId,
  onClose,
}: {
  survey: MetadataSurvey;
  detailDrawerId?: string;
  onClose: () => void;
}) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [detailDrawerWidth, setDetailDrawerWidth] = useState(0);
  const attributeRequest = GET_SURVEY_ATTRIBUTES([survey.statcode]);
  const { data, loading, error } = useQuery(attributeRequest.query, {
    variables: attributeRequest.variables,
  });
  const attributes = (data?.attributes || []) as SurveyAttribute[];
  const description = attributes.find(
    (attribute) => attribute.attribute.code === "description",
  )?.value;
  const groupedAttributes = attributes.filter(
    (attribute) => attribute.attribute.code !== "description",
  );
  const statKinds = getAttributeValues(groupedAttributes, "stat_kind");
  const surveyUnits = getAttributeValues(groupedAttributes, "survey_units");
  const surveyCycles = getAttributeValues(groupedAttributes, "survey_cycle");

  useEffect(() => {
    setContainer(document.body);
  }, []);

  useEffect(() => {
    if (!detailDrawerId || !container) {
      setDetailDrawerWidth(0);
      return;
    }

    const drawerContent = document.querySelector<HTMLElement>(
      `[data-drawer-content-id="${detailDrawerId}"]`,
    );

    if (!drawerContent) {
      setDetailDrawerWidth(0);
      return;
    }

    const updateWidth = () => {
      setDetailDrawerWidth(drawerContent.getBoundingClientRect().width);
    };
    const resizeObserver = new ResizeObserver(updateWidth);

    updateWidth();
    resizeObserver.observe(drawerContent);
    window.addEventListener("resize", updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [container, detailDrawerId]);

  if (!container) {
    return null;
  }

  const sideDrawerStyle =
    detailDrawerWidth > 0
      ? ({
          "--metadata-detail-drawer-width": `${detailDrawerWidth}px`,
        } as CSSProperties)
      : undefined;

  return createPortal(
    <aside
      className="fixed inset-y-0 left-0 z-50 flex w-[min(34rem,92vw)] flex-col overflow-y-auto border-r border-base-300 bg-base-100 p-4 text-base-content shadow-2xl sm:p-5 lg:left-auto lg:right-[var(--metadata-detail-drawer-width,28rem)] lg:w-[min(34rem,calc(100vw_-_var(--metadata-detail-drawer-width,28rem)))]"
      style={sideDrawerStyle}
    >

      <div className="flex items-start gap-3">
        <LuClipboardList className="mt-1 size-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-base-content/60">{survey.statcode}</p>
          <h2 className="text-xl font-bold leading-7">{survey.statname}</h2>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          aria-label="統計調査の詳細を閉じる"
          onClick={onClose}
        >
          <FiX />
        </button>
      </div>

      <div className="divider divider-primary" />


      <dl className="grid gap-3 text-sm">
        {survey.isDiscontinued ? (
          <DiscontinuedBadge />
        ) : null}
        <div>
          <dt className="text-base-content/60">府省</dt>
          <dd className="font-medium">{survey.govname || "不明"}</dd>
        </div>
        <div>
          <dt className="text-base-content/60">統計表数</dt>
          <dd className="font-medium">{Number(survey.tableCount ?? 0)} 件</dd>
        </div>
      </dl>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-base-content/70">
          <span className="loading loading-spinner loading-sm text-primary" />
          読み込み中です
        </div>
      ) : error instanceof Error ? (
        <p className="mt-6 text-sm text-error">{error.message}</p>
      ) : (
        <div className="mt-6 space-y-5">
          {description ? (
            <section>
              <h3 className="mb-2 text-sm font-semibold">概要</h3>
              <p className="whitespace-pre-wrap text-sm leading-6 text-base-content/80">
                {description}
              </p>
            </section>
          ) : null}

          {groupedAttributes.length > 0 ? (
            <section>
              <h3 className="mb-2 text-sm font-semibold">属性</h3>
              <div className="flex flex-col gap-3 text-sm">
                {statKinds.length > 0 ? (
                  <AttributeBadgeRow label="統計の種類">
                    {statKinds.map((value) => (
                      <ReadonlyAttributeBadge
                        key={value}
                        value={value}
                        icon={<BiAward />}
                      />
                    ))}
                  </AttributeBadgeRow>
                ) : null}

                {surveyUnits.length > 0 ? (
                  <AttributeBadgeRow label="調査対象">
                    {surveyUnits.map((value) => (
                      <ReadonlyAttributeBadge
                        key={value}
                        value={value}
                        icon={<SurveyUnitIcon value={value} />}
                      />
                    ))}
                  </AttributeBadgeRow>
                ) : null}

                {surveyCycles.length > 0 ? (
                  <AttributeBadgeRow label="調査周期">
                    {surveyCycles.map((value) => (
                      <ReadonlyAttributeBadge
                        key={value}
                        value={value}
                        icon={<RiLoopLeftFill />}
                      />
                    ))}
                  </AttributeBadgeRow>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </aside>,
    container,
  );
}

function getAttributeValues(attributes: SurveyAttribute[], code: string) {
  return Array.from(
    new Set(
      attributes
        .filter((attribute) => attribute.attribute.code === code)
        .map((attribute) => attribute.value),
    ),
  );
}

function AttributeBadgeRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-medium text-base-content/70">{label}:</span>
      {children}
    </div>
  );
}

function ReadonlyAttributeBadge({
  value,
  icon,
}: {
  value: string;
  icon: ReactNode;
}) {
  return (
    <span className="badge badge-outline gap-1.5 px-3 py-4">
      {icon}
      <span>{value}</span>
    </span>
  );
}
