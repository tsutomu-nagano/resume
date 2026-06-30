import { describe, expect, it } from "vitest";
import { extractNaturalLanguageEntities } from "./naturalLanguageSearch";

describe("extractNaturalLanguageEntities", () => {
  it("extracts time ranges and keyword spans", () => {
    const entities = extractNaturalLanguageEntities(
      "東京都の人口を2020年から2022年で年齢別に検索",
    );

    expect(entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          spanText: "東京都",
          kinds: expect.arrayContaining(["region", "measure"]),
        }),
        expect.objectContaining({
          spanText: "人口",
          kinds: expect.arrayContaining(["measure"]),
        }),
        expect.objectContaining({
          spanText: "2020年から2022年",
          kinds: ["time"],
          normalizedValue: "2020-2022",
        }),
        expect.objectContaining({
          spanText: "年齢",
          kinds: expect.arrayContaining(["dimension"]),
        }),
      ]),
    );
  });

  it("normalizes Japanese era years", () => {
    const entities = extractNaturalLanguageEntities("令和2年の世帯数");

    expect(entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          spanText: "令和2年",
          kinds: ["time"],
          normalizedValue: "2020-2020",
        }),
      ]),
    );
  });
});
