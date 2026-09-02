import { afterEach, describe, expect, it, vi } from "vitest";
import { extractNaturalLanguageEntities } from "./naturalLanguageSearch";

describe("extractNaturalLanguageEntities", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

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
    expect(entities.flatMap((entity) => entity.kinds)).not.toEqual(
      expect.arrayContaining(["survey_unit", "stat_kind"]),
    );
  });

  it("extracts survey names and latest time requests", () => {
    const entities = extractNaturalLanguageEntities("国勢調査の最新の人口");

    expect(entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          spanText: "国勢調査",
          kinds: expect.arrayContaining(["stat"]),
        }),
        expect.objectContaining({
          spanText: "最新",
          kinds: ["time"],
          normalizedValue: "latest",
        }),
        expect.objectContaining({
          spanText: "人口",
          kinds: expect.arrayContaining(["measure"]),
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

  it("normalizes relative years", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-03T00:00:00+09:00"));

    const entities = extractNaturalLanguageEntities(
      "去年の人口と一昨年の世帯数と昨年の住宅数と5年前の就業者数と５年前の賃金",
    );

    expect(entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          spanText: "去年",
          kinds: ["time"],
          normalizedValue: "2025-2025",
        }),
        expect.objectContaining({
          spanText: "一昨年",
          kinds: ["time"],
          normalizedValue: "2024-2024",
        }),
        expect.objectContaining({
          spanText: "昨年",
          kinds: ["time"],
          normalizedValue: "2025-2025",
        }),
        expect.objectContaining({
          spanText: "5年前",
          kinds: ["time"],
          normalizedValue: "2021-2021",
        }),
        expect.objectContaining({
          spanText: "５年前",
          kinds: ["time"],
          normalizedValue: "2021-2021",
        }),
      ]),
    );
  });

  it("normalizes ranges with relative years", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-03T00:00:00+09:00"));

    const entities = extractNaturalLanguageEntities("一昨年から去年の人口");

    expect(entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          spanText: "一昨年から去年",
          kinds: ["time"],
          normalizedValue: "2024-2025",
        }),
      ]),
    );
  });

  it("normalizes ranges with years ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-03T00:00:00+09:00"));

    const entities = extractNaturalLanguageEntities("5年前から去年の人口");

    expect(entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          spanText: "5年前から去年",
          kinds: ["time"],
          normalizedValue: "2021-2025",
        }),
      ]),
    );
  });
});
