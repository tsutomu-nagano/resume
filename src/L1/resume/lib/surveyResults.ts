import type { SurveyAttribute } from "./queries";

export type SurveyResult = {
  statcode: string;
  statname: string;
  govlist: {
    govname: string;
  };
  table_count?: { aggregate?: { count?: number } };
  attributes?: SurveyAttribute[];
};

export function isSurveyResult(value: unknown): value is SurveyResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const survey = value as Partial<SurveyResult>;

  return (
    typeof survey.statcode === "string" &&
    typeof survey.statname === "string" &&
    typeof survey.govlist?.govname === "string"
  );
}

export function toSurveyCardProps(survey: SurveyResult) {
  return {
    statcode: survey.statcode,
    statname: survey.statname,
    govname: survey.govlist.govname,
    tableCount: Number(survey.table_count?.aggregate?.count ?? 0),
    attributes: survey.attributes ?? [],
  };
}
