
import * as z from 'zod';


const numPattern = "[0-9０-９]";
const eraPattern = "([SHRshrＳＨＲｓｒｈ]|昭和|平成|令和)"

const yearRegexp = new RegExp(`^(${numPattern}{4}|${eraPattern}(${numPattern}{1,2}|元))年?$`)
// const yearRegexp  = /^[0-9０-９]{4}年?$/

// 全角→半角
function normalize(input: string): string {
  return input.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  )
    // 末尾の「年」(全角/半角どちらでも) を削除
    .replace(/年$/, "");
}

// 西暦に変換
function toAD(yearStr: string): number | null {
  const normalized = normalize(yearStr);

  // 西暦4桁
  if (/^\d{4}$/.test(normalized)) {
    return Number(normalized);
  }

  // 元号
  const m = normalized.match(/^([SHRshrＳＨＲｓｒｈ]|昭和|平成|令和)(\d{1,2}|元)年?$/);
  if (!m) return null;

  const era = m[1].toUpperCase();
  const year = m[2] === "元" ? 1 : Number(m[2]);

  switch (era) {
    case "R": return 2018 + year; // 令和元年 = 2019
    case "H": return 1988 + year; // 平成元年 = 1989
    case "S": return 1925 + year; // 昭和元年 = 1926
    case "T": return 1911 + year; // 大正元年 = 1912
    default: return null;
  }
}

export const yearSchema = z
  .string()
  .optional()
  .refine(val => !val || yearRegexp.test(val), {
    message: "西暦4桁または和暦で入力してください",
  })
  .transform((val) => {
    if (!val) return "";
    const ad = toAD(val);
    if (ad === null) {
      throw new Error("変換できません");
    }
    return String(ad);
  });
