import type { SurveyAttribute } from "./queries";

export type SurveyResult = {
  statcode: string;
  statname: string;
  table_count?: { aggregate?: { count?: number } };
  attributes?: SurveyAttribute[];
};

export function toSurveyCardProps(survey: SurveyResult) {
  return {
    statcode: survey.statcode,
    statname: survey.statname,
    tableCount: Number(survey.table_count?.aggregate?.count ?? 0),
    attributes: survey.attributes ?? [],
  };
}
