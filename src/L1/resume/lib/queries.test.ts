import { print } from "graphql";
import { describe, expect, it } from "vitest";
import { GET_SURVEY_ATTRIBUTES, GET_SURVEY_LIST } from "./queries";

describe("GET_SURVEY_LIST", () => {
  it("queries surveys through their matching tables", () => {
    const request = GET_SURVEY_LIST(
      new Map([["stat", new Set(["民間企業の勤務条件制度等調査"])]])
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

  it("requests card attributes for the current survey page", () => {
    const request = GET_SURVEY_ATTRIBUTES(["00020111"]);

    expect(print(request.query)).toContain("STAT_ATTRIBUTE_VALUES");
    expect(request.variables).toEqual({ statcodes: ["00020111"] });
  });
  });
});
