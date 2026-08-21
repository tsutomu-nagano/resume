import { describe, expect, it } from "vitest";
import {
  buildTableExplorerTree,
  type TableExplorerResult,
} from "./tableExplorer";

const baseTable: TableExplorerResult = {
  statdispid: "0001",
  statcode: "001",
  survey: {
    statname: "人口動態調査",
  },
  cycle: "年次",
  survey_date: "2024",
  title: "基礎データ",
  year_s: "2024",
  year_e: "2024",
  table_tags: [],
  table_measures: [],
  table_dimensions: [],
  table_regions: [],
};

describe("buildTableExplorerTree", () => {
  it("groups tables by metadata folders", () => {
    const tree = buildTableExplorerTree([
      {
        ...baseTable,
        table_tags: [{ tag_name: "基礎データ" }],
        table_regions: [{ regiontype: "ken" }],
        table_dimensions: [{ class_name: "性別" }],
      },
    ]);

    expect(tree[0].label).toBe("人口動態調査");
    expect(tree[0].children[0].label).toBe("基礎データ");
    expect(tree[0].children[0].children).toHaveLength(0);
    expect(tree[0].children[0].tables[0].statdispid).toBe("0001");
  });

  it("uses fallback folders when metadata is missing", () => {
    const tree = buildTableExplorerTree([baseTable]);

    expect(tree[0].label).toBe("人口動態調査");
    expect(tree[0].children[0].label).toBe("提供分類なし");
    expect(tree[0].children[0].children).toHaveLength(0);
  });
});
