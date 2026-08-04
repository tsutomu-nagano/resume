import { gql } from "@apollo/client";
import type { DocumentNode } from "graphql";
import { BuilderCondition } from "./BuilderCondition";

export interface GraphQLRequest {
  query: DocumentNode;
  variables?: Record<string, unknown>;
}

export type DimensionSearchMode = "class" | "item" | "both";

function getItemsWithoutKind(
  items: Map<string, Set<string>>,
  kind: string,
): Map<string, Set<string>> {
  return getItemsWithoutKinds(items, [kind]);
}

function getItemsWithoutKinds(
  items: Map<string, Set<string>>,
  kinds: string[],
): Map<string, Set<string>> {
  const excludedKinds = new Set(kinds);

  return new Map(
    Array.from(items.entries())
      .filter(([itemKind]) => !excludedKinds.has(itemKind))
      .map(([itemKind, values]) => [itemKind, new Set(values)] as const),
  );
}

const tableListFields = gql`
  fragment TableListFields on TABLELIST {
    statdispid: STATDISPID
    cycle: CYCLE
    statcode: STATCODE
    survey_date: SURVEY_DATE
    title: TITLE
    year_s: YEAR_S
    year_e: YEAR_E
    table_tags: TABLE_TAGs {
      tag_name: TAG_NAME
    }
    table_measures: TABLE_MEASUREs {
      name: NAME
    }
    table_dimensions: TABLE_DIMENSIONs {
      class_name: CLASS_NAME
    }
    table_regions: TABLE_REGIONTYPEs {
      regiontype: REGIONTYPE
    }
  }
`;

function buildDimensionTableWhere(name: string) {
  return {
    TABLE_DIMENSIONs: {
      CLASS_NAME: { _eq: name },
    },
  };
}

export const GET_TABLE_LIST = (
  items: Map<string, Set<string>>,
): GraphQLRequest => ({
  query: gql`
    ${tableListFields}
    query GetTableList(
      $where: TABLELIST_bool_exp!
      $limit_number: Int
      $offset_number: Int
    ) {
      tablelist: TABLELIST(
        where: $where
        limit: $limit_number
        offset: $offset_number
        order_by: { STATDISPID: asc }
      ) {
        ...TableListFields
      }
    }
  `,
  variables: {
    where: BuilderCondition(items),
  },
});

const surveyListFields = gql`
  fragment SurveyListFields on STATLIST {
    statcode: STATCODE
    statname: STATNAME
    govlist: GOVLIST {
      govname: GOVNAME
    }
    table_count: TABLELISTs_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_SURVEY_LIST = (
  items: Map<string, Set<string>>,
): GraphQLRequest => ({
  query: gql`
    ${surveyListFields}
    query GetSurveyList(
      $where: TABLELIST_bool_exp!
      $limit_number: Int
      $offset_number: Int
    ) {
      surveylist: STATLIST(
        where: { TABLELISTs: $where }
        limit: $limit_number
        offset: $offset_number
        order_by: { STATNAME: asc }
      ) {
        ...SurveyListFields
      }
    }
  `,
  variables: {
    where: BuilderCondition(items),
  },
});

export const GET_TABLE_LIST_COUNT = (
  items: Map<string, Set<string>>,
  metadataSearchTerm = "",
  dimensionSearchMode: DimensionSearchMode = "both",
): GraphQLRequest => ({
  query: gql`
    query GetTableListCount(
      $where: TABLELIST_bool_exp!
      $measureWhere: MEASURELIST_bool_exp!
      $dimensionWhere: DIMENSIONLIST_bool_exp!
      $themeWhere: TAGLIST_bool_exp!
      $regionWhere: REGIONLIST_bool_exp!
    ) {
      tablelist_aggregate: TABLELIST_aggregate(where: $where) {
        aggregate {
          stat: count(distinct: true, column: STATCODE)
          db: count(distinct: true, column: STATDISPID)
        }
      }
      metadata_measures: MEASURELIST_aggregate(where: $measureWhere) {
        aggregate {
          count(distinct: true, column: NAME)
        }
      }
      metadata_dimensions: DIMENSIONLIST_aggregate(where: $dimensionWhere) {
        aggregate {
          count(distinct: true, column: CLASS_NAME)
        }
      }
      metadata_themes: TAGLIST_aggregate(where: $themeWhere) {
        aggregate {
          count(distinct: true, column: TAG_NAME)
        }
      }
      metadata_regions: REGIONLIST_aggregate(where: $regionWhere) {
        aggregate {
          count(distinct: true, column: NAME)
        }
      }
    }
  `,
  variables: {
    where: BuilderCondition(items),
    ...buildMetadataWhereVariables(
      items,
      metadataSearchTerm,
      dimensionSearchMode,
    ),
  },
});

export const GET_METADATA_LIST = (
  items: Map<string, Set<string>>,
  searchTerm = "",
  dimensionSearchMode: DimensionSearchMode = "both",
): GraphQLRequest => ({
  query: gql`
    query GetMetadataList(
      $measureWhere: MEASURELIST_bool_exp!
      $dimensionWhere: DIMENSIONLIST_bool_exp!
      $themeWhere: TAGLIST_bool_exp!
      $regionWhere: REGIONLIST_bool_exp!
      $limit_number: Int
      $offset_number: Int
    ) {
      measures: MEASURELIST(
        where: $measureWhere
        limit: $limit_number
        offset: $offset_number
        order_by: { NAME: asc }
      ) {
        name: NAME
      }
      dimensions: DIMENSIONLIST(
        where: $dimensionWhere
        limit: $limit_number
        offset: $offset_number
        order_by: { CLASS_NAME: asc }
      ) {
        name: CLASS_NAME
        matching_items: DIMENSION_ITEMs(where: $dimensionItemWhere, limit: 5) {
          name: NAME
        }
      }
      themes: TAGLIST(
        where: $themeWhere
        limit: $limit_number
        offset: $offset_number
        order_by: { TAG_NAME: asc }
      ) {
        name: TAG_NAME
      }
      regions: REGIONLIST(
        where: $regionWhere
        limit: $limit_number
        offset: $offset_number
        order_by: { NAME: asc }
      ) {
        name: NAME
      }
    }
  `,
  variables: {
    ...buildMetadataWhereVariables(items, searchTerm, dimensionSearchMode),
  },
});

function buildMetadataWhereVariables(
  items: Map<string, Set<string>>,
  searchTerm: string,
  dimensionSearchMode: DimensionSearchMode = "both",
) {
  const tableWhere = BuilderCondition(items);
  const searchPattern = searchTerm.trim() ? `%${searchTerm.trim()}%` : null;
  const dimensionNameSearch =
    searchPattern && dimensionSearchMode !== "item"
      ? { CLASS_NAME: { _like: searchPattern } }
      : null;
  const dimensionItemSearch =
    searchPattern && dimensionSearchMode !== "class"
      ? { DIMENSION_ITEMs: { NAME: { _like: searchPattern } } }
      : null;
  const dimensionTextConditions = [
    dimensionNameSearch,
    dimensionItemSearch,
  ].filter(Boolean);

  return {
    measureWhere: {
      TABLE_MEASUREs: { TABLELIST: tableWhere },
      ...(searchPattern ? { NAME: { _like: searchPattern } } : {}),
    },
    dimensionWhere: {
      TABLE_DIMENSIONs: { TABLELIST: tableWhere },
      ...(dimensionTextConditions.length > 1
        ? { _or: dimensionTextConditions }
        : dimensionTextConditions.length === 1
          ? dimensionTextConditions[0]
          : {}),
    },
    dimensionItemWhere:
      searchPattern && dimensionSearchMode !== "class"
        ? { NAME: { _like: searchPattern } }
        : {},
    themeWhere: {
      TABLE_TAGs: { TABLELIST: tableWhere },
      ...(searchPattern ? { TAG_NAME: { _like: searchPattern } } : {}),
    },
    regionWhere: {
      TABLE_REGIONs: { TABLELIST: tableWhere },
      ...(searchPattern ? { NAME: { _like: searchPattern } } : {}),
    },
  };
}

export type SurveyAttribute = {
  statcode: string;
  value: string;
  attribute: {
    code: string;
    label: string;
  };
};

export const GET_SURVEY_ATTRIBUTES = (statcodes: string[]): GraphQLRequest => ({
  query: gql`
    query GetSurveyAttributes($statcodes: [String!]!) {
      attributes: STAT_ATTRIBUTE_VALUES(
        where: {
          STATCODE: { _in: $statcodes }
          STAT_ATTRIBUTE: {
            CODE: {
              _in: ["description", "survey_units", "survey_cycle", "stat_kind"]
            }
          }
        }
      ) {
        statcode: STATCODE
        value: VALUE
        attribute: STAT_ATTRIBUTE {
          code: CODE
          label: NAME_JA
        }
      }
    }
  `,
  variables: {
    statcodes,
  },
});

export const GET_SURVEY_STATCODES = (
  items: Map<string, Set<string>>,
): GraphQLRequest => ({
  query: gql`
    query GetSurveyStatcodes(
      $tableWhere: TABLELIST_bool_exp!
      $surveyUnits: [String!]!
    ) {
      items: STAT_ATTRIBUTE_VALUES(
        where: {
          STATLIST: { TABLELISTs: $tableWhere }
          STAT_ATTRIBUTE: { CODE: { _eq: "survey_units" } }
          VALUE: { _in: $surveyUnits }
        }
      ) {
        statcode: STATCODE
      }
    }
  `,
  variables: {
    tableWhere: BuilderCondition(getItemsWithoutKind(items, "survey_unit")),
    surveyUnits: Array.from(items.get("survey_unit") || []),
  },
});

export const GET_SURVEY_ATTRIBUTE_STATCODES = (
  attributeCode: string,
  values: string[],
  items: Map<string, Set<string>>,
  excludedKinds: string[],
): GraphQLRequest => ({
  query: gql`
    query GetSurveyAttributeStatcodes(
      $tableWhere: TABLELIST_bool_exp!
      $attributeCode: String!
      $values: [String!]!
    ) {
      items: STAT_ATTRIBUTE_VALUES(
        where: {
          STATLIST: { TABLELISTs: $tableWhere }
          STAT_ATTRIBUTE: { CODE: { _eq: $attributeCode } }
          VALUE: { _in: $values }
        }
      ) {
        statcode: STATCODE
      }
    }
  `,
  variables: {
    tableWhere: BuilderCondition(getItemsWithoutKinds(items, excludedKinds)),
    attributeCode,
    values,
  },
});

const getItemsQueries: Record<string, DocumentNode> = {
  DIMENSION_ITEM: gql`
    query GetDimensionItems($className: String!) {
      items: DIMENSION_ITEM(where: { CLASS_NAME: { _eq: $className } }) {
        name: NAME
      }
    }
  `,
  REGION_ITEM: gql`
    query GetRegionItems($className: String!) {
      items: REGION_ITEM(where: { CLASS_NAME: { _eq: $className } }) {
        name: NAME
      }
    }
  `,
};

export const GET_ITEMS = (
  resourceName: string,
  name: string,
): GraphQLRequest => {
  const query = getItemsQueries[resourceName];

  if (!query) {
    throw new Error(`Unsupported item resource: ${resourceName}`);
  }

  return {
    query,
    variables: {
      className: name,
    },
  };
};

export const GET_METADATA_SURVEYS = (
  kind: string,
  name: string,
): GraphQLRequest => {
  const attributeCode = kind === "stat_kind" ? "stat_kind" : "survey_units";
  const tableWhereByKind: Record<string, Record<string, unknown>> = {
    measure: { TABLE_MEASUREs: { NAME: { _eq: name } } },
    dimension: buildDimensionTableWhere(name),
    thema: { TABLE_TAGs: { TAG_NAME: { _eq: name } } },
    region: { TABLE_REGIONs: { NAME: { _eq: name } } },
  };

  if (kind === "survey_unit" || kind === "stat_kind") {
    return {
      query: gql`
        query GetMetadataSurveysByAttribute(
          $attributeCode: String!
          $value: String!
        ) {
          surveyValues: STAT_ATTRIBUTE_VALUES(
            distinct_on: STATCODE
            order_by: { STATCODE: asc }
            where: {
              STAT_ATTRIBUTE: { CODE: { _eq: $attributeCode } }
              VALUE: { _eq: $value }
            }
          ) {
            statcode: STATCODE
            survey: STATLIST {
              statname: STATNAME
              govlist: GOVLIST {
                govname: GOVNAME
              }
              table_count: TABLELISTs_aggregate {
                aggregate {
                  count
                }
              }
            }
          }
        }
      `,
      variables: {
        attributeCode,
        value: name,
      },
    };
  }

  const tableWhere = tableWhereByKind[kind];

  if (!tableWhere) {
    throw new Error(`Unsupported metadata kind: ${kind}`);
  }

  return {
    query: gql`
      query GetMetadataSurveys($tableWhere: TABLELIST_bool_exp!) {
        surveys: STATLIST(
          order_by: { STATNAME: asc }
          where: { TABLELISTs: $tableWhere }
        ) {
          statcode: STATCODE
          statname: STATNAME
          govlist: GOVLIST {
            govname: GOVNAME
          }
          table_count: TABLELISTs_aggregate(where: $tableWhere) {
            aggregate {
              count
            }
          }
        }
      }
    `,
    variables: {
      tableWhere,
    },
  };
};

export const GET_METADATA_COUNTS = (
  kind: string,
  name: string,
): GraphQLRequest => {
  const attributeCode = kind === "stat_kind" ? "stat_kind" : "survey_units";
  const tableWhereByKind: Record<string, Record<string, unknown>> = {
    measure: { TABLE_MEASUREs: { NAME: { _eq: name } } },
    dimension: buildDimensionTableWhere(name),
    thema: { TABLE_TAGs: { TAG_NAME: { _eq: name } } },
    region: { TABLE_REGIONs: { NAME: { _eq: name } } },
  };

  if (kind === "survey_unit" || kind === "stat_kind") {
    return {
      query: gql`
        query GetMetadataCountsByAttribute(
          $attributeCode: String!
          $value: String!
        ) {
          surveyValues: STAT_ATTRIBUTE_VALUES(
            distinct_on: STATCODE
            order_by: { STATCODE: asc }
            where: {
              STAT_ATTRIBUTE: { CODE: { _eq: $attributeCode } }
              VALUE: { _eq: $value }
            }
          ) {
            statcode: STATCODE
            survey: STATLIST {
              tables: TABLELISTs_aggregate {
                aggregate {
                  count
                }
              }
            }
          }
        }
      `,
      variables: {
        attributeCode,
        value: name,
      },
    };
  }

  const tableWhere = tableWhereByKind[kind];

  if (!tableWhere) {
    throw new Error(`Unsupported metadata kind: ${kind}`);
  }

  return {
    query: gql`
      query GetMetadataCounts($tableWhere: TABLELIST_bool_exp!) {
        tables: TABLELIST_aggregate(where: $tableWhere) {
          aggregate {
            count
          }
        }
        surveys: STATLIST(
          order_by: { STATNAME: asc }
          where: { TABLELISTs: $tableWhere }
        ) {
          statcode: STATCODE
        }
      }
    `,
    variables: {
      tableWhere,
    },
  };
};

const searchTagListQueries: Record<string, DocumentNode> = {
  "STATLIST:STATNAME:TABLELISTs": gql`
    query SearchStatList(
      $tableWhere: TABLELIST_bool_exp!
      $searchPattern: String!
    ) {
      items: STATLIST(
        where: { TABLELISTs: $tableWhere, STATNAME: { _like: $searchPattern } }
      ) {
        name: STATNAME
      }
    }
  `,
  "MEASURELIST:NAME:TABLE_MEASUREs.TABLELIST": gql`
    query SearchMeasureList(
      $tableWhere: TABLELIST_bool_exp!
      $searchPattern: String!
    ) {
      items: MEASURELIST(
        where: {
          TABLE_MEASUREs: { TABLELIST: $tableWhere }
          NAME: { _like: $searchPattern }
        }
      ) {
        name: NAME
      }
    }
  `,
  "DIMENSIONLIST:CLASS_NAME:TABLE_DIMENSIONs.TABLELIST": gql`
    query SearchDimensionList(
      $tableWhere: TABLELIST_bool_exp!
      $searchPattern: String!
    ) {
      items: DIMENSIONLIST(
        where: {
          TABLE_DIMENSIONs: { TABLELIST: $tableWhere }
          _or: [
            { CLASS_NAME: { _like: $searchPattern } }
            { DIMENSION_ITEMs: { NAME: { _like: $searchPattern } } }
          ]
        }
      ) {
        name: CLASS_NAME
      }
    }
  `,
  "REGIONLIST:NAME:TABLE_REGIONs.TABLELIST": gql`
    query SearchRegionList(
      $tableWhere: TABLELIST_bool_exp!
      $searchPattern: String!
    ) {
      items: REGIONLIST(
        where: {
          TABLE_REGIONs: { TABLELIST: $tableWhere }
          NAME: { _like: $searchPattern }
        }
      ) {
        name: NAME
      }
    }
  `,
  "STAT_ATTRIBUTE_VALUES:VALUE:STATLIST.TABLELISTs": gql`
    query SearchSurveyAttributes(
      $tableWhere: TABLELIST_bool_exp!
      $attributeCode: String!
      $searchPattern: String!
    ) {
      items: STAT_ATTRIBUTE_VALUES(
        order_by: { VALUE: asc }
        where: {
          STATLIST: { TABLELISTs: $tableWhere }
          STAT_ATTRIBUTE: { CODE: { _eq: $attributeCode } }
          VALUE: { _like: $searchPattern }
        }
      ) {
        name: VALUE
      }
    }
  `,
};

export const GET_SEARCH_TAG_LIST = (
  name: string,
  field: string,
  refNames: string[],
  searchTerm: string,
  items: Map<string, Set<string>>,
  kind = "",
): GraphQLRequest => {
  const queryKey = `${name}:${field}:${refNames.join(".")}`;
  const query = searchTagListQueries[queryKey];

  if (!query) {
    throw new Error(`Unsupported search tag resource: ${queryKey}`);
  }

  return {
    query,
    variables: {
      tableWhere: BuilderCondition(
        getItemsWithoutKinds(items, ["survey_unit", "stat_kind"]),
      ),
      attributeCode: kind === "stat_kind" ? "stat_kind" : "survey_units",
      searchPattern: `%${searchTerm}%`,
    },
  };
};
