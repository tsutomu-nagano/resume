"use client";

import { useQuery } from "@apollo/client";
import { TbTable } from "react-icons/tb";
import { LuClipboardList } from "react-icons/lu";
import { GET_METADATA_COUNTS } from "@/lib/queries";

interface MetadataCardCountsProps {
  kind: string;
  name: string;
}

type AttributeCountItem = {
  statcode: string;
  survey?: {
    tables?: {
      aggregate?: {
        count?: number;
      } | null;
    } | null;
  } | null;
};

export function MetadataCardCounts({ kind, name }: MetadataCardCountsProps) {
  const countRequest = GET_METADATA_COUNTS(kind, name);
  const { data, loading, error } = useQuery(countRequest.query, {
    variables: countRequest.variables,
  });

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        <span className="badge badge-outline gap-1">
          <LuClipboardList className="size-3" />
          <span className="loading loading-spinner loading-xs" />
        </span>
        <span className="badge badge-outline gap-1">
          <TbTable className="size-3" />
          <span className="loading loading-spinner loading-xs" />
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-wrap gap-2">
        <span className="badge badge-error badge-outline">件数取得失敗</span>
      </div>
    );
  }

  const surveyCount = getSurveyCount(data);
  const tableCount = getTableCount(data);

  return (
    <div className="flex flex-wrap gap-2">
      <span className="badge badge-outline gap-1" title="統計調査数">
        <LuClipboardList className="size-3" />
        {surveyCount.toLocaleString()}
      </span>
      <span className="badge badge-outline gap-1" title="統計データ数">
        <TbTable className="size-3" />
        {tableCount.toLocaleString()}
      </span>
    </div>
  );
}

function getSurveyCount(data: any) {
  if (data?.surveyValues) {
    return new Set(
      data.surveyValues.map((item: AttributeCountItem) => item.statcode),
    ).size;
  }

  return new Set(
    (data?.surveys || []).map((item: { statcode: string }) => item.statcode),
  ).size;
}

function getTableCount(data: any) {
  if (data?.surveyValues) {
    return data.surveyValues.reduce(
      (total: number, item: AttributeCountItem) =>
        total + Number(item.survey?.tables?.aggregate?.count || 0),
      0,
    );
  }

  return Number(data?.tables?.aggregate?.count || 0);
}
