"use client";

import { useSearchItem } from "../contexts/SearchItemsProvider";
import { SearchCountResult } from "./SearchCountResult";

export function SearchCountResultContainer() {
  const { loading, error, countResult, setView, view } = useSearchItem();

  if (loading && !countResult) {
    return <span className="loading loading-spinner text-primary" />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <SearchCountResult
      stat={Number(countResult?.stat ?? 0)}
      db={Number(countResult?.db ?? 0)}
      view={view}
      onViewChange={setView}
    />
  );
}
