"use client";

import { useEffect, useRef } from "react";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import { InfiniteScrollContainer } from "./InfiniteScrollContainer";
import { MetadataCard } from "./MetadataCard";
import { ResultSkeletons } from "./ResultSkeletons";

type MetadataResult = {
  metadataId: string;
  kind: string;
  name: string;
};

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
  } = useSearchItem();
  const didFetch = useRef(false);

  useEffect(() => {
    if (!didFetch.current && searchResult.length === 0 && !isLast) {
      didFetch.current = true;
      void fetchMore();
    }
  }, [fetchMore, isLast, searchResult.length]);

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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {searchResult.filter(isMetadataResult).map((item) => (
          <MetadataCard
            key={item.metadataId}
            kind={item.kind}
            name={item.name}
            onSelect={addItem}
          />
        ))}
      </div>
    </InfiniteScrollContainer>
  );
}
