
import {
  Building2,
  Landmark,
  Store,
  UsersRound,
} from "lucide-react";
import {
  TbHome,
  TbTargetArrow,
  TbUser,
} from "react-icons/tb";


export type SurveyUnitIconKey =
  | "establishment"
  | "enterprise"
  | "corporation"
  | "organization"
  | "household"
  | "person"
  | "default";





export function SurveyUnitIcon({ value }: { value: string }) {
  const iconClassName = "size-4 shrink-0";

  switch (getSurveyUnitIconKey(value)) {
    case "establishment":
      return <Store className={iconClassName} aria-hidden />;
    case "enterprise":
      return <Building2 className={iconClassName} aria-hidden />;
    case "corporation":
      return <Landmark className={iconClassName} aria-hidden />;
    case "organization":
      return <UsersRound className={iconClassName} aria-hidden />;
    case "household":
      return <TbHome className={iconClassName} aria-hidden />;
    case "person":
      return <TbUser className={iconClassName} aria-hidden />;
    default:
      return <TbTargetArrow className={iconClassName} aria-hidden />;
  }
}


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
