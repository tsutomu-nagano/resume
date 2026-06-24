export type SurveyUnitIconKey =
  | "organization"
  | "household"
  | "person"
  | "default";

export function getSurveyUnitIconKey(value: string): SurveyUnitIconKey {
  if (/(企業|事業所|会社|法人|団体)/.test(value)) {
    return "organization";
  }

  if (/世帯/.test(value)) {
    return "household";
  }

  if (/(個人|人|児童|生徒)/.test(value)) {
    return "person";
  }

  return "default";
}
