import { describe, expect, it } from "vitest";
import { isSurveyResult, toSurveyCardProps } from "./surveyResults";

describe("toSurveyCardProps", () => {
  it("preserves overview attributes for survey cards", () => {
    const attributes = [
      {
        statcode: "00020111",
        value: "企業の雇用状況を把握する調査です。",
        attribute: { code: "description", label: "概要" },
      },
      {
        statcode: "00020111",
        value: "企業",
        attribute: { code: "survey_units", label: "調査単位" },
      },
    ];

    expect(
      toSurveyCardProps({
        statcode: "00020111",
        statname: "サンプル調査",
        govlist: { govname: "テスト府省" },
        discontinuedSurvey: { statcode: "00020111" },
        table_count: { aggregate: { count: 12 } },
        attributes,
      }),
    ).toEqual({
      statcode: "00020111",
      statname: "サンプル調査",
      govname: "テスト府省",
      tableCount: 12,
      isDiscontinued: true,
      attributes,
    });
  });

  it("uses an empty attribute list when no attributes are returned", () => {
    expect(
      toSurveyCardProps({
        statcode: "00020111",
        statname: "サンプル調査",
        govlist: { govname: "テスト府省" },
      }),
    ).toMatchObject({ tableCount: 0, isDiscontinued: false, attributes: [] });
  });

  it("rejects non-survey rows", () => {
    expect(
      isSurveyResult({
        statcode: "00020111",
        statdispid: "000001",
        title: "統計データ",
      }),
    ).toBe(false);
  });
});
