"use client";

import { useMemo, useState } from "react";
import { createApolloClient } from "@/lib/apolloClient";
import { GET_SEARCH_TAG_LIST } from "@/lib/queries";
import {
  extractNaturalLanguageEntities,
  NaturalLanguageEntity,
  NaturalLanguageKind,
} from "@/lib/naturalLanguageSearch";
import { kind_en2ja } from "../common/convertor";
import { useSearchItem } from "../contexts/SearchItemsProvider";

type ResolvedCandidate = {
  kind: NaturalLanguageKind;
  name: string;
  confidence: number;
};

type ResolvedEntity = NaturalLanguageEntity & {
  candidates: ResolvedCandidate[];
  status: "resolved" | "ambiguous" | "unresolved";
};

const searchTargets: Record<
  Exclude<NaturalLanguageKind, "time">,
  {
    resourceName: string;
    resourceField: string;
    refNames: string[];
  }
> = {
  stat: {
    resourceName: "STATLIST",
    resourceField: "STATNAME",
    refNames: ["TABLELISTs"],
  },
  survey_unit: {
    resourceName: "STAT_ATTRIBUTE_VALUES",
    resourceField: "VALUE",
    refNames: ["STATLIST", "TABLELISTs"],
  },
  stat_kind: {
    resourceName: "STAT_ATTRIBUTE_VALUES",
    resourceField: "VALUE",
    refNames: ["STATLIST", "TABLELISTs"],
  },
  measure: {
    resourceName: "MEASURELIST",
    resourceField: "NAME",
    refNames: ["TABLE_MEASUREs", "TABLELIST"],
  },
  dimension: {
    resourceName: "DIMENSIONLIST",
    resourceField: "CLASS_NAME",
    refNames: ["TABLE_DIMENSIONs", "TABLELIST"],
  },
  region: {
    resourceName: "REGIONLIST",
    resourceField: "NAME",
    refNames: ["TABLE_REGIONs", "TABLELIST"],
  },
};

function scoreCandidate(spanText: string, name: string) {
  if (name === spanText) {
    return 100;
  }

  if (name.startsWith(spanText)) {
    return 85;
  }

  if (name.includes(spanText)) {
    return 70;
  }

  return 50;
}

export function NaturalLanguageSearch() {
  const { items, addItems } = useSearchItem();
  const [text, setText] = useState("");
  const [resolvedEntities, setResolvedEntities] = useState<ResolvedEntity[]>(
    [],
  );
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    {},
  );
  const [showAnalysisResult, setShowAnalysisResult] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const client = useMemo(() => createApolloClient(), []);

  const resolveEntity = async (
    entity: NaturalLanguageEntity,
  ): Promise<ResolvedEntity> => {
    if (entity.kinds.includes("time")) {
      return {
        ...entity,
        candidates: entity.normalizedValue
          ? [
              {
                kind: "time",
                name: entity.normalizedValue,
                confidence: 100,
              },
            ]
          : [],
        status: entity.normalizedValue ? "resolved" : "unresolved",
      };
    }

    const candidateResults = await Promise.all(
      entity.kinds
        .filter((kind): kind is Exclude<NaturalLanguageKind, "time"> =>
          Boolean(searchTargets[kind as Exclude<NaturalLanguageKind, "time">]),
        )
        .map(async (kind) => {
          const target = searchTargets[kind];
          const result = await client.query(
            GET_SEARCH_TAG_LIST(
              target.resourceName,
              target.resourceField,
              target.refNames,
              entity.spanText,
              items,
              kind,
            ),
          );

          const resultItems = (
            (result.data.items || []) as { name: string }[]
          ).filter((item) => kind !== "stat" || item.name === entity.spanText);

          return resultItems.slice(0, 5).map((item) => ({
            kind,
            name: item.name,
            confidence: scoreCandidate(entity.spanText, item.name),
          }));
        }),
    );

    const candidates = Array.from(
      candidateResults
        .flat()
        .reduce((uniqueCandidates, candidate) => {
          const key = `${candidate.kind}:${candidate.name}`;
          const currentCandidate = uniqueCandidates.get(key);

          if (
            !currentCandidate ||
            candidate.confidence > currentCandidate.confidence
          ) {
            uniqueCandidates.set(key, candidate);
          }

          return uniqueCandidates;
        }, new Map<string, ResolvedCandidate>())
        .values(),
    )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);

    return {
      ...entity,
      candidates,
      status:
        candidates.length === 0
          ? "unresolved"
          : candidates.length === 1
            ? "resolved"
            : "ambiguous",
    };
  };

  const handleAnalyze = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      setResolvedEntities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const entities = extractNaturalLanguageEntities(trimmedText);
      const nextResolvedEntities = await Promise.all(
        entities.map((entity) => resolveEntity(entity)),
      );
      const nextSelections = Object.fromEntries(
        nextResolvedEntities
          .filter((entity) => entity.candidates[0])
          .map((entity) => [
            entity.id,
            `${entity.candidates[0].kind}:${entity.candidates[0].name}`,
          ]),
      );

      setResolvedEntities(nextResolvedEntities);
      setSelectedValues(nextSelections);
      setShowAnalysisResult(true);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    const nextItems = resolvedEntities.flatMap((entity) => {
      const selectedValue = selectedValues[entity.id];
      if (!selectedValue) {
        return [];
      }

      const separatorIndex = selectedValue.indexOf(":");
      const kind = selectedValue.slice(0, separatorIndex);
      const itemName = selectedValue.slice(separatorIndex + 1);

      return [{ kind, itemName }];
    });

    addItems(nextItems);
  };

  return (
    <section className="mx-0 rounded-md border border-base-300 bg-base-100 p-3 sm:mx-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="input input-bordered flex flex-1 items-center gap-2">
          <input
            type="text"
            className="grow"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleAnalyze();
              }
            }}
            placeholder="例: 東京都の人口を2020年から2022年で年齢別に検索"
          />
        </label>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void handleAnalyze()}
          disabled={loading}
        >
          {loading ? "解析中" : "自然言語で解析"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-error">{error.message}</p>}

      {resolvedEntities.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-base-content/70">自然言語処理の結果</p>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() =>
                setShowAnalysisResult(
                  (currentShowAnalysisResult) => !currentShowAnalysisResult,
                )
              }
            >
              {showAnalysisResult ? "結果を非表示" : "結果を表示"}
            </button>
          </div>

          {showAnalysisResult && (
            <div className="mt-2 overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>文章中の語</th>
                    <th>抽出種別</th>
                    <th>検索条件</th>
                    <th>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedEntities.map((entity) => (
                    <tr key={entity.id}>
                      <td className="font-medium">{entity.spanText}</td>
                      <td>
                        {entity.candidates[0]
                          ? kind_en2ja(entity.candidates[0].kind)
                          : entity.kinds
                              .map((kind) => kind_en2ja(kind))
                              .join(" / ")}
                      </td>
                      <td>
                        {entity.candidates.length > 0 ? (
                          <select
                            className="select select-bordered select-sm w-full max-w-xs"
                            value={selectedValues[entity.id] || ""}
                            onChange={(event) =>
                              setSelectedValues((previous) => ({
                                ...previous,
                                [entity.id]: event.target.value,
                              }))
                            }
                          >
                            {entity.candidates.map((candidate) => (
                              <option
                                key={`${candidate.kind}:${candidate.name}`}
                                value={`${candidate.kind}:${candidate.name}`}
                              >
                                {kind_en2ja(candidate.kind)}: {candidate.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-base-content/60">候補なし</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            entity.status === "unresolved"
                              ? "badge-error"
                              : entity.status === "ambiguous"
                                ? "badge-warning"
                                : "badge-success"
                          }`}
                        >
                          {entity.status === "unresolved"
                            ? "未解決"
                            : entity.status === "ambiguous"
                              ? "候補あり"
                              : "確定"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                className="btn btn-outline btn-sm mt-2"
                onClick={handleApply}
              >
                選択した条件で検索
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
