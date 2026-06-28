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

export function toSurveyCardProps(survey: SurveyResult) {
  return {
    statcode: survey.statcode,
    statname: survey.statname,
    govname: survey.govlist.govname,
    tableCount: Number(survey.table_count?.aggregate?.count ?? 0),
    attributes: survey.attributes ?? [],
  };
}
