"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import type { DimensionSearchMode } from "@/lib/queries";
import { kind_en2ja, renderIconByKind } from "../common/convertor";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import { InfiniteScrollContainer } from "./InfiniteScrollContainer";
import { MetadataCard } from "./MetadataCard";
import { ResultSkeletons } from "./ResultSkeletons";

type MetadataResult = {
  metadataId: string;
  kind: string;
  name: string;
  matching_items?: { name: string }[];
};

const metadataKindOrder = ["measure", "dimension", "thema", "region"];

const hiddenMetadataKinds = new Set(["survey_unit", "stat_kind"]);

function isMetadataResult(value: unknown): value is MetadataResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<MetadataResult>;

  return (
    typeof item.metadataId === "string" &&
    typeof item.kind === "string" &&
    typeof item.name === "string"
  );
}

export default function MetadataList() {
  const {
    loading,
    error,
    fetchMore,
    searchResult,
    isLast,
    isFetchingMore,
    addItem,
    findItem,
    removeItem,
    metadataSearchTerm,
    setMetadataSearchTerm,
    dimensionSearchMode,
    setDimensionSearchMode,
    countResult,
  } = useSearchItem();
  const didFetch = useRef(false);
  const [hiddenKinds, setHiddenKinds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    didFetch.current = false;
  }, [dimensionSearchMode, metadataSearchTerm]);

  useEffect(() => {
    if (!didFetch.current && searchResult.length === 0 && !isLast) {
      didFetch.current = true;
      void fetchMore();
    }
  }, [fetchMore, isLast, searchResult.length]);

  const metadataResults = useMemo(() => {
    const uniqueResults = new Map<string, MetadataResult>();

    searchResult.filter(isMetadataResult).forEach((item) => {
      if (hiddenMetadataKinds.has(item.kind)) {
        return;
      }

      uniqueResults.set(item.metadataId, item);
    });

    return Array.from(uniqueResults.values());
  }, [searchResult]);

  const metadataKinds = useMemo(() => {
    const metadataCounts = countResult?.metadataCounts;

    if (metadataCounts && typeof metadataCounts === "object") {
      return Object.entries(metadataCounts)
        .filter(
          ([kind, count]) =>
            !hiddenMetadataKinds.has(kind) && Number(count) > 0,
        )
        .map(([kind, count]) => [kind, Number(count)] as const)
        .sort(
          ([leftKind], [rightKind]) =>
            getMetadataKindOrder(leftKind) - getMetadataKindOrder(rightKind),
        );
    }

    const counts = new Map<string, number>();

    metadataResults.forEach((item) => {
      counts.set(item.kind, (counts.get(item.kind) || 0) + 1);
    });

    const kinds = new Set([
      ...Array.from(counts.keys()),
    ]);

    return Array.from(kinds)
      .map((kind) => [kind, Number(counts.get(kind) ?? 0)] as const)
      .sort(
        ([leftKind], [rightKind]) =>
          getMetadataKindOrder(leftKind) - getMetadataKindOrder(rightKind),
      );
  }, [countResult?.metadataCounts, metadataResults]);

  const visibleResults = useMemo(
    () => metadataResults.filter((item) => !hiddenKinds.has(item.kind)),
    [hiddenKinds, metadataResults],
  );

  const toggleKind = (kind: string) => {
    setHiddenKinds((currentHiddenKinds) => {
      const nextHiddenKinds = new Set(currentHiddenKinds);

      if (nextHiddenKinds.has(kind)) {
        nextHiddenKinds.delete(kind);
      } else {
        nextHiddenKinds.add(kind);
      }

      return nextHiddenKinds;
    });
  };

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <InfiniteScrollContainer
      fetchMore={fetchMore}
      isLast={isLast}
      isFetchingMore={isFetchingMore}
    >
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <label className="input input-bordered flex min-w-0 flex-1 items-center gap-2">
            <input
              type="search"
              className="grow"
              placeholder="メタデータ名で検索"
              value={metadataSearchTerm}
              onChange={(event) => setMetadataSearchTerm(event.target.value)}
            />
            {isFetchingMore || loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <FiSearch className="text-base-content/50" />
            )}
          </label>
          {metadataSearchTerm && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setMetadataSearchTerm("")}
            >
              クリア
            </button>
          )}
        </div>
        <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-sm text-base-content/70">
            分類事項の検索対象
          </span>
          <label className="label cursor-pointer justify-start gap-2 p-0">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={dimensionSearchMode !== "item"}
              onChange={(event) =>
                setDimensionSearchMode(
                  getNextDimensionSearchMode(
                    dimensionSearchMode,
                    "class",
                    event.target.checked,
                  ),
                )
              }
            />
            <span className="label-text">事項名</span>
          </label>
          <label className="label cursor-pointer justify-start gap-2 p-0">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={dimensionSearchMode !== "class"}
              onChange={(event) =>
                setDimensionSearchMode(
                  getNextDimensionSearchMode(
                    dimensionSearchMode,
                    "item",
                    event.target.checked,
                  ),
                )
              }
            />
            <span className="label-text">項目名</span>
          </label>
        </fieldset>
        {metadataKinds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {metadataKinds.map(([kind, count]) => {
              const isHidden = hiddenKinds.has(kind);

              return (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={!isHidden}
                  className={`btn btn-sm gap-2 ${isHidden ? "btn-outline opacity-60" : "btn-primary"}`}
                  onClick={() => toggleKind(kind)}
                >
                  {renderIconByKind(kind)}
                  <span>{kind_en2ja(kind)}</span>
                  <span className="badge badge-sm badge-outline">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {loading && searchResult.length === 0 ? (
        <ResultSkeletons view="metadata" />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleResults.map((item) => (
          <MetadataCard
            key={item.metadataId}
            kind={item.kind}
            name={item.name}
            matchReason={getDimensionMatchReason(
              item,
              metadataSearchTerm,
              dimensionSearchMode,
            )}
            isSelected={findItem(item.kind, item.name)}
            onToggle={() => {
              if (findItem(item.kind, item.name)) {
                removeItem(item.kind, item.name);
              } else {
                addItem(item.kind, item.name);
              }
            }}
          />
        ))}
      </div>
      {metadataResults.length > 0 && visibleResults.length === 0 && (
        <p className="py-10 text-center text-sm text-base-content/60">
          表示するメタデータの種類を選択してください
        </p>
      )}
      {!loading && metadataResults.length === 0 && metadataSearchTerm && (
        <p className="py-10 text-center text-sm text-base-content/60">
          一致するメタデータがありません
        </p>
      )}
    </InfiniteScrollContainer>
  );
}

function getMetadataKindOrder(kind: string) {
  const index = metadataKindOrder.indexOf(kind);
  return index === -1 ? metadataKindOrder.length : index;
}

function getNextDimensionSearchMode(
  currentMode: DimensionSearchMode,
  target: "class" | "item",
  checked: boolean,
): DimensionSearchMode {
  const nextTargets = new Set<"class" | "item">();

  if (currentMode !== "item") {
    nextTargets.add("class");
  }

  if (currentMode !== "class") {
    nextTargets.add("item");
  }

  if (checked) {
    nextTargets.add(target);
  } else {
    nextTargets.delete(target);
  }

  if (nextTargets.size === 0) {
    nextTargets.add(target === "class" ? "item" : "class");
  }

  if (nextTargets.size === 2) {
    return "both";
  }

  return nextTargets.has("class") ? "class" : "item";
}

function getDimensionMatchReason(
  item: MetadataResult,
  searchTerm: string,
  dimensionSearchMode: DimensionSearchMode,
) {
  if (item.kind !== "dimension" || !searchTerm.trim()) {
    return null;
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const matchedByClass =
    dimensionSearchMode !== "item" &&
    item.name.toLowerCase().includes(normalizedSearchTerm);
  const matchedItemNames = (item.matching_items || []).map(({ name }) => name);
  const matchedByItem =
    dimensionSearchMode !== "class" && matchedItemNames.length > 0;

  if (!matchedByClass && !matchedByItem) {
    return null;
  }

  return {
    matchedByClass,
    matchedByItem,
    matchedItemNames,
  };
}
