"use client";

import { useEffect, useState } from "react";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import { SearchCountResult } from "./SearchCountResult";

type DisplayCountResult = {
  stat: number;
  db: number;
  metadata: number;
};

export function SearchCountResultContainer() {
  const { error, countResult, setView, view } = useSearchItem();
  const [displayCountResult, setDisplayCountResult] =
    useState<DisplayCountResult | null>(null);
  const isCountLoading = countResult == null;

  useEffect(() => {
    if (!countResult) {
      return;
    }

    setDisplayCountResult({
      stat: Number(countResult.stat ?? 0),
      db: Number(countResult.db ?? 0),
      metadata: Number(countResult.metadata ?? 0),
    });
  }, [countResult]);

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <SearchCountResult
      stat={displayCountResult?.stat ?? 0}
      db={displayCountResult?.db ?? 0}
      metadata={displayCountResult?.metadata ?? 0}
      isCountLoading={isCountLoading}
      view={view}
      onViewChange={setView}
    />
  );
}
