import { describe, expect, it } from "vitest";
import { BuilderCondition } from "./BuilderCondition";

describe("BuilderCondition", () => {
  it("returns an empty expression when no filters are selected", () => {
    expect(BuilderCondition(new Map())).toEqual({});
  });

  it("groups multiple equality values with _or", () => {
    const items = new Map([["stat", new Set(["人口", "世帯"])]]);

    expect(BuilderCondition(items)).toEqual({
      _and: [
        {
          _or: [
            { STATLIST: { STATNAME: { _eq: "人口" } } },
            { STATLIST: { STATNAME: { _eq: "世帯" } } },
          ],
        },
      ],
    });
  });

  it("filters tables by resolved survey codes", () => {
    const items = new Map([["statcode", new Set(["00020111", "00020112"])]]);

    expect(BuilderCondition(items)).toEqual({
      _and: [
        {
          _or: [
            { STATCODE: { _eq: "00020111" } },
            { STATCODE: { _eq: "00020112" } },
          ],
        },
      ],
    });
  });

  it("builds a bounded year range", () => {
    const items = new Map([["time", new Set(["2020-2022"])]]);

    expect(BuilderCondition(items)).toEqual({
      _and: [{ TABLE_TIMEs: { YEAR: { _gte: 2020, _lte: 2022 } } }],
    });
  });

  it("ignores invalid year ranges", () => {
    const items = new Map([["time", new Set(["from-to"])]]);

    expect(BuilderCondition(items)).toEqual({});
  });
});
