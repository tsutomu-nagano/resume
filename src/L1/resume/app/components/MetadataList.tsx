"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { kind_en2ja, renderIconByKind } from "../common/convertor";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import { InfiniteScrollContainer } from "./InfiniteScrollContainer";
import { MetadataCard } from "./MetadataCard";
import { ResultSkeletons } from "./ResultSkeletons";

type MetadataResult = {
  metadataId: string;
  kind: string;
  name: string;
};

const metadataKindOrder = [
  "measure",
  "dimension",
  "thema",
  "region",
];

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
  } = useSearchItem();
  const didFetch = useRef(false);
  const [hiddenKinds, setHiddenKinds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!didFetch.current && searchResult.length === 0 && !isLast) {
      didFetch.current = true;
      void fetchMore();
    }
  }, [fetchMore, isLast, searchResult.length]);

  const metadataResults = useMemo(
    () => {
      const uniqueResults = new Map<string, MetadataResult>();

      searchResult.filter(isMetadataResult).forEach((item) => {
        if (hiddenMetadataKinds.has(item.kind)) {
          return;
        }

        uniqueResults.set(item.metadataId, item);
      });

      return Array.from(uniqueResults.values());
    },
    [searchResult],
  );

  const metadataKinds = useMemo(() => {
    const counts = new Map<string, number>();

    metadataResults.forEach((item) => {
      counts.set(item.kind, (counts.get(item.kind) || 0) + 1);
    });

    return Array.from(counts.entries()).sort(
      ([leftKind], [rightKind]) =>
        getMetadataKindOrder(leftKind) - getMetadataKindOrder(rightKind),
    );
  }, [metadataResults]);

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

  if (loading) {
    return <ResultSkeletons view="metadata" />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <InfiniteScrollContainer
      fetchMore={fetchMore}
      isLast={isLast}
      isFetchingMore={isFetchingMore}
    >
      {metadataKinds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleResults.map((item) => (
          <MetadataCard
            key={item.metadataId}
            kind={item.kind}
            name={item.name}
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
    </InfiniteScrollContainer>
  );
}

function getMetadataKindOrder(kind: string) {
  const index = metadataKindOrder.indexOf(kind);
  return index === -1 ? metadataKindOrder.length : index;
}
