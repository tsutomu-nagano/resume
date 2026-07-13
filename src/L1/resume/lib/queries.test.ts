import { print } from "graphql";
import { describe, expect, it } from "vitest";
import {
  GET_METADATA_LIST,
  GET_SEARCH_TAG_LIST,
  GET_TABLE_LIST_COUNT,
  GET_SURVEY_ATTRIBUTE_STATCODES,
  GET_SURVEY_ATTRIBUTES,
  GET_SURVEY_LIST,
  GET_SURVEY_STATCODES,
} from "./queries";

describe("survey queries", () => {
  it("queries surveys through their matching tables", () => {
    const request = GET_SURVEY_LIST(
      new Map([["stat", new Set(["民間企業の勤務条件制度等調査"])]]),
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

  it("counts metadata search results with table results", () => {
    const request = GET_TABLE_LIST_COUNT(new Map());
    const query = print(request.query);

    expect(query).toContain("metadata_measures: MEASURELIST_aggregate");
    expect(query).toContain("metadata_dimensions: DIMENSIONLIST_aggregate");
    expect(query).toContain("metadata_themes: TAGLIST_aggregate");
    expect(query).toContain("metadata_regions: REGIONLIST_aggregate");
    expect(query).not.toContain("metadata_survey_units");
    expect(query).not.toContain("metadata_stat_kinds");
    expect(request.variables).toEqual({
      where: {},
      measureWhere: { TABLE_MEASUREs: { TABLELIST: {} } },
      dimensionWhere: { TABLE_DIMENSIONs: { TABLELIST: {} } },
      themeWhere: { TABLE_TAGs: { TABLELIST: {} } },
      regionWhere: { TABLE_REGIONs: { TABLELIST: {} } },
    });
  });

  it("filters metadata list by text", () => {
    const request = GET_METADATA_LIST(new Map(), "人口");
    const query = print(request.query);

    expect(query).toContain("GetMetadataList");
    expect(request.variables).toEqual({
      measureWhere: {
        TABLE_MEASUREs: { TABLELIST: {} },
        NAME: { _like: "%人口%" },
      },
      dimensionWhere: {
        TABLE_DIMENSIONs: { TABLELIST: {} },
        CLASS_NAME: { _like: "%人口%" },
      },
      themeWhere: {
        TABLE_TAGs: { TABLELIST: {} },
        TAG_NAME: { _like: "%人口%" },
      },
      regionWhere: {
        TABLE_REGIONs: { TABLELIST: {} },
        NAME: { _like: "%人口%" },
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
      ]),
    );

    expect(print(request.query)).toContain("STAT_ATTRIBUTE_VALUES");
    expect(request.variables).toEqual({
      tableWhere: {
        _and: [{ TABLE_TIMEs: { YEAR: { _gte: 2020 } } }],
      },
      surveyUnits: ["事業所"],
    });
  });

  it("searches stat kinds from survey attributes", () => {
    const request = GET_SEARCH_TAG_LIST(
      "STAT_ATTRIBUTE_VALUES",
      "VALUE",
      ["STATLIST", "TABLELISTs"],
      "基幹",
      new Map([["stat_kind", new Set(["一般統計"])]]),
      "stat_kind",
    );

    expect(print(request.query)).toContain("SearchSurveyAttributes");
    expect(print(request.query)).not.toContain("distinct_on");
    expect(request.variables).toEqual({
      tableWhere: {},
      attributeCode: "stat_kind",
      searchPattern: "%基幹%",
    });
  });

  it("searches dimension classes by class name and item name", () => {
    const request = GET_SEARCH_TAG_LIST(
      "DIMENSIONLIST",
      "CLASS_NAME",
      ["TABLE_DIMENSIONs", "TABLELIST"],
      "男",
      new Map(),
      "dimension",
    );

    const query = print(request.query);

    expect(query).toContain("SearchDimensionList");
    expect(query).toContain("CLASS_NAME");
    expect(query).toContain("DIMENSION_ITEMs");
    expect(query).toContain("NAME");
    expect(request.variables).toEqual({
      tableWhere: {},
      attributeCode: "survey_units",
      searchPattern: "%男%",
    });
  });

  it("resolves stat kinds to survey codes", () => {
    const request = GET_SURVEY_ATTRIBUTE_STATCODES(
      "stat_kind",
      ["基幹統計"],
      new Map([
        ["stat_kind", new Set(["基幹統計"])],
        ["time", new Set(["2020-"])],
      ]),
      ["stat_kind"],
    );

    expect(print(request.query)).toContain("GetSurveyAttributeStatcodes");
    expect(request.variables).toEqual({
      tableWhere: {
        _and: [{ TABLE_TIMEs: { YEAR: { _gte: 2020 } } }],
      },
      attributeCode: "stat_kind",
      values: ["基幹統計"],
    });
  });
});
