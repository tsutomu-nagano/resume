"use client";

import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { LuClipboardList } from "react-icons/lu";
import { GET_METADATA_SURVEYS } from "@/lib/queries";

interface MetadataSurveyListProps {
  kind: string;
  name: string;
  isOpen: boolean;
}

type MetadataSurvey = {
  statcode: string;
  statname: string;
};

type MetadataSurveyValue = {
  statcode: string;
  survey?: {
    statname?: string;
  } | null;
};

export function MetadataSurveyList({
  kind,
  name,
  isOpen,
}: MetadataSurveyListProps) {
  const surveyRequest = GET_METADATA_SURVEYS(kind, name);
  const { data, loading, error, refetch } = useQuery(surveyRequest.query, {
    variables: surveyRequest.variables,
    skip: !isOpen,
  });
  const surveys = getUniqueSurveys(
    data?.surveys ||
      (data?.surveyValues || []).map((item: MetadataSurveyValue) => ({
        statcode: item.statcode,
        statname: item.survey?.statname || item.statcode,
      })),
  );

  useEffect(() => {
    if (isOpen) {
      refetch();
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
              className="flex items-start gap-2 rounded border border-base-300 bg-base-100 p-3"
            >
              <LuClipboardList className="mt-1 shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="font-medium leading-6">
                  {survey.statname}
                </span>
                <span className="text-xs text-base-content/60">
                  {survey.statcode}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>該当する統計調査はありません。</p>
      )}
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
