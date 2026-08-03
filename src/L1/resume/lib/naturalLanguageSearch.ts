export type NaturalLanguageKind =
  | "stat"
  | "survey_unit"
  | "stat_kind"
  | "measure"
  | "dimension"
  | "region"
  | "time";

export type NaturalLanguageEntity = {
  id: string;
  spanText: string;
  start: number;
  end: number;
  kinds: NaturalLanguageKind[];
  normalizedValue?: string;
};

const candidateKinds: NaturalLanguageKind[] = [
  "stat",
  "measure",
  "dimension",
  "region",
];

const stopWords = new Set([
  "で",
  "の",
  "を",
  "が",
  "に",
  "から",
  "まで",
  "と",
  "や",
  "について",
  "見たい",
  "知りたい",
  "検索",
  "探す",
  "調べる",
]);

function normalizeDigits(value: string): string {
  return value.replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0),
  );
}

function normalizeYear(value: string): number | undefined {
  const normalizedValue = normalizeDigits(value.trim());
  const currentYear = new Date().getFullYear();
  const relativeYears: Record<string, number> = {
    去年: currentYear - 1,
    昨年: currentYear - 1,
    一昨年: currentYear - 2,
  };
  const relativeYear = relativeYears[normalizedValue];
  if (relativeYear) {
    return relativeYear;
  }

  const yearsAgo = normalizedValue.match(/(\d+)\s*年前/);
  if (yearsAgo) {
    return currentYear - Number(yearsAgo[1]);
  }

  const westernYear = normalizedValue.match(/(\d{4})\s*(?:年|年度)?/);
  if (westernYear) {
    return Number(westernYear[1]);
  }

  const reiwaYear = normalizedValue.match(/令和\s*(元|\d+)\s*(?:年|年度)?/);
  if (reiwaYear) {
    return 2018 + (reiwaYear[1] === "元" ? 1 : Number(reiwaYear[1]));
  }

  const heiseiYear = normalizedValue.match(/平成\s*(元|\d+)\s*(?:年|年度)?/);
  if (heiseiYear) {
    return 1988 + (heiseiYear[1] === "元" ? 1 : Number(heiseiYear[1]));
  }

  return undefined;
}

function extractTimeEntities(text: string): NaturalLanguageEntity[] {
  const entities: NaturalLanguageEntity[] = [];
  const yearExpression =
    String.raw`(?:[0-9０-９]{4}|令和\s*(?:元|[0-9０-９]+)|平成\s*(?:元|[0-9０-９]+)|[0-9０-９]+\s*年前|去年|昨年|一昨年)`;
  const rangePattern =
    new RegExp(
      `(${yearExpression}\\s*(?:年|年度)?)\\s*(?:から|以降|[-~〜～])\\s*(${yearExpression}\\s*(?:年|年度)?|現在|今)`,
      "g",
    );
  const singlePattern = new RegExp(
    `${yearExpression}\\s*(?:年|年度)?`,
    "g",
  );

  for (const match of text.matchAll(rangePattern)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const fromYear = normalizeYear(match[1]);
    const toYear =
      match[2] === "現在" || match[2] === "今" ? "" : normalizeYear(match[2]);

    if (fromYear) {
      entities.push({
        id: `time:${start}:${end}`,
        spanText: match[0],
        start,
        end,
        kinds: ["time"],
        normalizedValue: `${fromYear}-${toYear ?? ""}`,
      });
    }
  }

  for (const match of text.matchAll(singlePattern)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const overlapsRange = entities.some(
      (entity) => start >= entity.start && end <= entity.end,
    );

    if (overlapsRange) {
      continue;
    }

    const year = normalizeYear(match[0]);
    if (year) {
      entities.push({
        id: `time:${start}:${end}`,
        spanText: match[0],
        start,
        end,
        kinds: ["time"],
        normalizedValue: `${year}-${year}`,
      });
    }
  }

  return entities;
}

function getNonTimeSegments(
  text: string,
  timeEntities: NaturalLanguageEntity[],
) {
  const segments: { text: string; offset: number }[] = [];
  let cursor = 0;

  for (const entity of [...timeEntities].sort((a, b) => a.start - b.start)) {
    if (cursor < entity.start) {
      segments.push({ text: text.slice(cursor, entity.start), offset: cursor });
    }
    cursor = entity.end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), offset: cursor });
  }

  return segments;
}

function cleanToken(token: string): string {
  return token
    .replace(
      /^[\s、。,.，．「」（）()【】]+|[\s、。,.，．「」（）()【】]+$/g,
      "",
    )
    .replace(/(別|ごと|毎|について|を見たい|が知りたい|を検索)$/g, "");
}

function splitTokenByParticles(token: string, baseStart: number) {
  const parts: { token: string; start: number }[] = [];
  const delimiterPattern =
    /(について|から|まで|の|を|で|に|が|と|や|、|。|,|，)/g;
  let cursor = 0;

  for (const match of token.matchAll(delimiterPattern)) {
    const delimiterStart = match.index ?? 0;
    if (cursor < delimiterStart) {
      parts.push({
        token: token.slice(cursor, delimiterStart),
        start: baseStart + cursor,
      });
    }
    cursor = delimiterStart + match[0].length;
  }

  if (cursor < token.length) {
    parts.push({
      token: token.slice(cursor),
      start: baseStart + cursor,
    });
  }

  return parts;
}

function extractKeywordEntities(
  text: string,
  timeEntities: NaturalLanguageEntity[],
): NaturalLanguageEntity[] {
  const entities: NaturalLanguageEntity[] = [];
  const segments = getNonTimeSegments(text, timeEntities);
  const tokenPattern = /[一-龠々ぁ-んァ-ヶーA-Za-z0-9]+/g;

  for (const segment of segments) {
    for (const match of segment.text.matchAll(tokenPattern)) {
      const rawToken = match[0];
      const rawStart = segment.offset + (match.index ?? 0);

      for (const part of splitTokenByParticles(rawToken, rawStart)) {
        const token = cleanToken(part.token);

        if (token.length < 2 || stopWords.has(token)) {
          continue;
        }

        const tokenOffset = part.token.indexOf(token);
        const start = part.start + tokenOffset;
        const end = start + token.length;

        entities.push({
          id: `keyword:${start}:${end}`,
          spanText: token,
          start,
          end,
          kinds: candidateKinds,
        });
      }
    }
  }

  return entities;
}

export function extractNaturalLanguageEntities(
  text: string,
): NaturalLanguageEntity[] {
  const timeEntities = extractTimeEntities(text);
  const keywordEntities = extractKeywordEntities(text, timeEntities);

  return [...timeEntities, ...keywordEntities].sort(
    (a, b) => a.start - b.start,
  );
}
