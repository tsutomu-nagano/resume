import { describe, expect, it } from "vitest";
import { getSurveyUnitIconKey } from "./surveyUnitIcons";

describe("getSurveyUnitIconKey", () => {
  it.each([
    ["事業所", "establishment"],
    ["企業", "enterprise"],
    ["法人", "corporation"],
    ["団体", "organization"],
    ["法人・団体", "corporation"],
    ["世帯", "household"],
    ["個人", "person"],
    ["その他", "default"],
  ] as const)("classifies %s as %s", (value, expected) => {
    expect(getSurveyUnitIconKey(value)).toBe(expected);
  });
});
