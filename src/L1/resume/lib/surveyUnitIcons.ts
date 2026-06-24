export type SurveyUnitIconKey =
  | "establishment"
  | "enterprise"
  | "corporation"
  | "organization"
  | "household"
  | "person"
  | "default";

export function getSurveyUnitIconKey(value: string): SurveyUnitIconKey {
  if (/法人/.test(value)) {
    return "corporation";
  }

  if (/事業所/.test(value)) {
    return "establishment";
  }

  if (/(企業|会社)/.test(value)) {
    return "enterprise";
  }

  if (/団体/.test(value)) {
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
