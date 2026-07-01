type GraphQLCondition = Record<string, unknown>;

type EqualityConditionConfig = {
  kind: string;
  tableName?: string;
  columnName: string;
};

const equalityConditionConfigs: EqualityConditionConfig[] = [
  { kind: "stat", tableName: "STATLIST", columnName: "STATNAME" },
  { kind: "statcode", columnName: "STATCODE" },
  { kind: "measure", tableName: "TABLE_MEASUREs", columnName: "NAME" },
  { kind: "thema", tableName: "TABLE_TAGs", columnName: "TAG_NAME" },
  { kind: "dimension", tableName: "TABLE_DIMENSIONs", columnName: "CLASS_NAME" },
  { kind: "region", tableName: "TABLE_REGIONs", columnName: "NAME" },
];

function buildEqualityConditions(
  items: Map<string, Set<string>>,
  { kind, tableName, columnName }: EqualityConditionConfig
): GraphQLCondition[] {
  const itemsOfKind = items.get(kind);

  if (!itemsOfKind || itemsOfKind.size === 0) {
    return [];
  }

  return Array.from(itemsOfKind).map((item) => {
    const comparison = { [columnName]: { _eq: item } };

    return tableName ? { [tableName]: comparison } : comparison;
  });
}

function buildTimeConditions(
  items: Map<string, Set<string>>,
  kind: string,
  tableName: string,
  columnName: string
): GraphQLCondition[] {
  const itemsOfKind = items.get(kind);

  if (!itemsOfKind || itemsOfKind.size === 0) {
    return [];
  }

  const conditions: GraphQLCondition[] = [];

  for (const item of itemsOfKind) {
    const [from, to] = item.split("-");
    const yearCondition: Record<string, number> = {};

    if (from !== "") {
      const fromYear = Number(from);
      if (!Number.isNaN(fromYear)) {
        yearCondition._gte = fromYear;
      }
    }

    if (to !== "") {
      const toYear = Number(to);
      if (!Number.isNaN(toYear)) {
        yearCondition._lte = toYear;
      }
    }

    if (Object.keys(yearCondition).length > 0) {
      conditions.push({
        [tableName]: {
          [columnName]: yearCondition,
        },
      });
    }
  }

  return conditions;
}

function groupOrConditions(conditions: GraphQLCondition[]): GraphQLCondition | undefined {
  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { _or: conditions };
}

export function BuilderCondition(items: Map<string, Set<string>>): GraphQLCondition {
  const conditions = [
    ...equalityConditionConfigs.map((config) =>
      groupOrConditions(buildEqualityConditions(items, config))
    ),
    groupOrConditions(buildTimeConditions(items, "time", "TABLE_TIMEs", "YEAR")),
  ].filter((condition): condition is GraphQLCondition => condition !== undefined);

  if (conditions.length === 0) {
    return {};
  }

  return { _and: conditions };
}
