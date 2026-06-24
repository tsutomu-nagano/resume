import { print } from "graphql";
import { describe, expect, it } from "vitest";
import {
  GET_SURVEY_ATTRIBUTES,
  GET_SURVEY_LIST,
  GET_SURVEY_STATCODES,
} from "./queries";

describe("survey queries", () => {
  it("queries surveys through their matching tables", () => {
    const request = GET_SURVEY_LIST(
      new Map([["stat", new Set(["民間企業の勤務条件制度等調査"])]] )
    );

    expect(print(request.query)).toContain("surveylist: STATLIST");
    expect(print(request.query)).toContain("TABLELISTs_aggregate");
    expect(request.variables).toEqual({
      where: {
        _and: [
          {
            STATLIST: {
              STATNAME: {
                _eq: "民間企業の勤務条件制度等調査",
              },
            },
          },
        ],
      },
    });
  });

  it("requests card attributes for the current survey page", () => {
    const request = GET_SURVEY_ATTRIBUTES(["00020111"]);

    expect(print(request.query)).toContain("STAT_ATTRIBUTE_VALUES");
    expect(request.variables).toEqual({ statcodes: ["00020111"] });
  });

  it("resolves selected survey units to survey codes", () => {
    const request = GET_SURVEY_STATCODES(
      new Map([
        ["survey_unit", new Set(["事業所"])],
        ["time", new Set(["2020-"])],
      ])
    );

    expect(print(request.query)).toContain("STAT_ATTRIBUTE_VALUES");
    expect(request.variables).toEqual({
      tableWhere: {
        _and: [{ TABLE_TIMEs: { YEAR: { _gte: 2020 } } }],
      },
      surveyUnits: ["事業所"],
    });
  });
});
