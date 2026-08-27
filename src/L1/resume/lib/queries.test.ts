import { print } from "graphql";
import { describe, expect, it } from "vitest";
import {
  GET_METADATA_COUNTS,
  GET_METADATA_LIST,
  GET_METADATA_SURVEYS,
  GET_SEARCH_TAG_LIST,
  GET_TABLE_LIST_COUNT,
  GET_SURVEY_ATTRIBUTE_STATCODES,
  GET_SURVEY_ATTRIBUTES,
  GET_SURVEY_COMPARISON_LIST,
  GET_SURVEY_LIST,
  GET_SURVEY_STATCODES,
  GET_TABLE_LIST,
  GET_TABLE_THEME_LIST,
} from "./queries";

describe("survey queries", () => {
  it("queries surveys through their matching tables", () => {
    const request = GET_SURVEY_LIST(
      new Map([["stat", new Set(["民間企業の勤務条件制度等調査"])]]),
    );

    expect(print(request.query)).toContain("surveylist: STATLIST");
    expect(print(request.query)).toContain(
      "discontinuedSurvey: DISCONTINUED_SURVEYs",
    );
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
    expect(query).not.toContain("metadata_dimension_items");
    expect(query).not.toContain("metadata_dimension_overlaps");
    expect(query).toContain("metadata_themes: TAGLIST_aggregate");
    expect(query).toContain("metadata_regions: REGIONLIST_aggregate");
    expect(query).not.toContain("metadata_survey_units");
    expect(query).not.toContain("metadata_stat_kinds");
    expect(request.variables).toEqual({
      where: {},
      measureWhere: { TABLE_MEASUREs: { TABLELIST: {} } },
      dimensionWhere: { TABLE_DIMENSIONs: { TABLELIST: {} } },
      dimensionItemWhere: {},
      themeWhere: { TABLE_TAGs: { TABLELIST: {} } },
      regionWhere: {},
    });
  });

  it("filters metadata list by text", () => {
    const request = GET_METADATA_LIST(new Map(), "人口");
    const query = print(request.query);

    expect(query).toContain("GetMetadataList");
    expect(query).toContain("attributes: MEASURE_ATTRIBUTEs");
    expect(query).toContain("attribute: ATTRIBUTE");
    expect(query).toContain("value: VALUE");
    expect(query).toContain("$dimensionItemWhere: DIMENSION_ITEM_bool_exp!");
    expect(query).toContain(
      "matching_items: DIMENSION_ITEMs(where: $dimensionItemWhere, limit: 5)",
    );
    expect(query).toContain("item_dimensions: DIMENSIONLIST");
    expect(query).toContain("where: $dimensionItemMatchedWhere");
    expect(query).not.toContain("_or");
    expect(request.variables).toEqual({
      measureWhere: {
        TABLE_MEASUREs: { TABLELIST: {} },
        NAME: { _like: "%人口%" },
      },
      dimensionWhere: {
        TABLE_DIMENSIONs: { TABLELIST: {} },
        CLASS_NAME: { _like: "%人口%" },
      },
      dimensionItemMatchedWhere: {
        TABLE_DIMENSIONs: { TABLELIST: {} },
        DIMENSION_ITEMs: { NAME: { _like: "%人口%" } },
      },
      dimensionOverlapWhere: {
        TABLE_DIMENSIONs: { TABLELIST: {} },
        CLASS_NAME: { _like: "%人口%" },
        DIMENSION_ITEMs: { NAME: { _like: "%人口%" } },
      },
      dimensionItemWhere: { NAME: { _like: "%人口%" } },
      themeWhere: {
        TABLE_TAGs: { TABLELIST: {} },
        TAG_NAME: { _like: "%人口%" },
      },
      regionWhere: { NAME: { _like: "%人口%" } },
    });
  });

  it("counts split dimension metadata without double-counting overlaps", () => {
    const request = GET_TABLE_LIST_COUNT(new Map(), "人口");
    const query = print(request.query);

    expect(query).toContain("metadata_dimension_items");
    expect(query).toContain("metadata_dimension_overlaps");
    expect(request.variables).toMatchObject({
      dimensionWhere: {
        TABLE_DIMENSIONs: { TABLELIST: {} },
        CLASS_NAME: { _like: "%人口%" },
      },
      dimensionItemMatchedWhere: {
        TABLE_DIMENSIONs: { TABLELIST: {} },
        DIMENSION_ITEMs: { NAME: { _like: "%人口%" } },
      },
      dimensionOverlapWhere: {
        TABLE_DIMENSIONs: { TABLELIST: {} },
        CLASS_NAME: { _like: "%人口%" },
        DIMENSION_ITEMs: { NAME: { _like: "%人口%" } },
      },
    });
  });

  it("keeps table counts stable while filtering metadata counts by text", () => {
    const request = GET_TABLE_LIST_COUNT(new Map(), "人口", "both");

    expect(request.variables?.where).toEqual({});
    expect(request.variables).toMatchObject({
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
      regionWhere: { NAME: { _like: "%人口%" } },
    });
  });

  it("does not push metadata text filters into survey and table list queries", () => {
    const surveysRequest = GET_SURVEY_LIST(new Map());
    const tablesRequest = GET_TABLE_LIST(new Map());
    const themeRequest = GET_TABLE_THEME_LIST(new Map());

    expect(surveysRequest.variables?.where).toEqual({});
    expect(tablesRequest.variables?.where).toEqual({});
    expect(themeRequest.variables?.tableWhere).toEqual({});
  });

  it("filters dimension metadata by class name only", () => {
    const request = GET_METADATA_LIST(new Map(), "性別", "class");

    expect(request.variables).toMatchObject({
      dimensionWhere: {
        TABLE_DIMENSIONs: { TABLELIST: {} },
        CLASS_NAME: { _like: "%性別%" },
      },
      dimensionItemWhere: {},
    });
  });

  it("filters dimension metadata by item name only", () => {
    const request = GET_METADATA_LIST(new Map(), "男", "item");

    expect(request.variables).toMatchObject({
      dimensionWhere: {
        TABLE_DIMENSIONs: { TABLELIST: {} },
        DIMENSION_ITEMs: { NAME: { _like: "%男%" } },
      },
      dimensionItemWhere: { NAME: { _like: "%男%" } },
    });
  });

  it("requests card attributes for the current survey page", () => {
    const request = GET_SURVEY_ATTRIBUTES(["00020111"]);

    expect(print(request.query)).toContain("STAT_ATTRIBUTE_VALUES");
    expect(request.variables).toEqual({ statcodes: ["00020111"] });
  });

  it("requests selected surveys for comparison", () => {
    const request = GET_SURVEY_COMPARISON_LIST(["国勢調査", "人口動態調査"]);
    const query = print(request.query);

    expect(query).toContain("GetSurveyComparisonList");
    expect(query).toContain("where: {STATNAME: {_in: $names}}");
    expect(query).toContain("table_count: TABLELISTs_aggregate");
    expect(request.variables).toEqual({
      names: ["国勢調査", "人口動態調査"],
    });
  });

  it("requests survey detail fields for metadata survey lists", () => {
    const request = GET_METADATA_SURVEYS("measure", "人口");
    const query = print(request.query);

    expect(query).toContain("govlist: GOVLIST");
    expect(query).toContain("table_count: TABLELISTs_aggregate");
    expect(request.variables).toEqual({
      tableWhere: { TABLE_MEASUREs: { NAME: { _eq: "人口" } } },
    });
  });

  it("opens selected survey details without treating surveys as metadata", () => {
    const surveysRequest = GET_METADATA_SURVEYS("stat", "国勢調査");
    const countsRequest = GET_METADATA_COUNTS("stat", "国勢調査");

    expect(print(surveysRequest.query)).toContain("GetMetadataSurveyByName");
    expect(surveysRequest.variables).toEqual({ name: "国勢調査" });
    expect(print(countsRequest.query)).toContain(
      "GetMetadataCountsBySurveyName",
    );
    expect(countsRequest.variables).toEqual({ name: "国勢調査" });
  });

  it("requests dimension metadata surveys by class name", () => {
    const request = GET_METADATA_SURVEYS("dimension", "男");

    expect(request.variables).toEqual({
      tableWhere: {
        TABLE_DIMENSIONs: {
          CLASS_NAME: { _eq: "男" },
        },
      },
    });
  });

  it("filters region metadata surveys through linked region names", () => {
    const surveysRequest = GET_METADATA_SURVEYS("region", "深谷市");
    const countsRequest = GET_METADATA_COUNTS("region", "深谷市");

    expect(surveysRequest.variables).toEqual({
      tableWhere: {
        TABLE_REGIONs: {
          REGIONLIST: {
            NAME: { _eq: "深谷市" },
          },
        },
      },
    });
    expect(countsRequest.variables).toEqual({
      tableWhere: {
        TABLE_REGIONs: {
          REGIONLIST: {
            NAME: { _eq: "深谷市" },
          },
        },
      },
    });
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

  it("searches other surveys while a survey is already selected", () => {
    const request = GET_SEARCH_TAG_LIST(
      "STATLIST",
      "STATNAME",
      ["TABLELISTs"],
      "人口",
      new Map([
        ["stat", new Set(["国勢調査"])],
        ["time", new Set(["2020-"])],
      ]),
      "stat",
    );

    expect(print(request.query)).toContain("SearchStatList");
    expect(request.variables).toEqual({
      tableWhere: {
        _and: [{ TABLE_TIMEs: { YEAR: { _gte: 2020 } } }],
      },
      attributeCode: "survey_units",
      searchPattern: "%人口%",
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
