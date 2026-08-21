export type TableExplorerResult = {
  statdispid: string;
  statcode: string;
  survey?: {
    statname?: string;
  };
  statlist?: {
    statname?: string;
  };
  cycle: string;
  survey_date: string;
  title: string;
  year_s: string;
  year_e: string;
  table_tags: { tag_name: string }[];
  table_measures: { name: string }[];
  table_dimensions: { class_name: string }[];
  table_regions: { regiontype: string }[];
};

export type TableExplorerNode = {
  id: string;
  label: string;
  kind: TableExplorerLevel;
  count: number;
  tables: TableExplorerResult[];
  children: TableExplorerNode[];
};

type TableExplorerLevel = "stat" | "thema";

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function tableLabels(table: TableExplorerResult, level: TableExplorerLevel) {
  if (level === "stat") {
    const statname = table.survey?.statname || table.statlist?.statname;
    return statname ? [statname] : [];
  }

  if (level === "thema") {
    return uniqueValues(table.table_tags.map(({ tag_name }) => tag_name));
  }

  return [];
}

function fallbackLabel(level: TableExplorerLevel) {
  if (level === "stat") {
    return "統計調査なし";
  }

  if (level === "thema") {
    return "提供分類なし";
  }

  return "フォルダなし";
}

function buildLevel(
  tables: TableExplorerResult[],
  levels: TableExplorerLevel[],
  path: string[],
): TableExplorerNode[] {
  const [level, ...nextLevels] = levels;

  if (!level) {
    return [];
  }

  const groupedTables = new Map<string, TableExplorerResult[]>();

  for (const table of tables) {
    const labels = tableLabels(table, level);
    const groupLabels = labels.length > 0 ? labels : [fallbackLabel(level)];

    for (const label of groupLabels) {
      groupedTables.set(label, [...(groupedTables.get(label) || []), table]);
    }
  }

  return Array.from(groupedTables.entries())
    .sort(([left], [right]) => left.localeCompare(right, "ja"))
    .map(([label, groupTables]) => ({
      id: [...path, level, label].join(":"),
      label,
      kind: level,
      count: groupTables.length,
      tables: groupTables,
      children: buildLevel(groupTables, nextLevels, [...path, level, label]),
    }));
}

export function buildTableExplorerTree(tables: TableExplorerResult[]) {
  return buildLevel(tables, ["stat", "thema"], []);
}
