"use client";

import { renderIconByKind } from "../common/convertor";
import type { SearchResultView } from "../contexts/SearchItemsContext";

interface SearchCountResultProps {
  stat: number;
  db: number;
  metadata: number;
  isCountLoading?: boolean;
  view: SearchResultView;
  onViewChange: (view: SearchResultView) => void;
}

export function SearchCountResult({
  stat,
  db,
  metadata,
  isCountLoading = false,
  view,
  onViewChange,
}: SearchCountResultProps) {
  const renderCount = (count: number) =>
    isCountLoading ? (
      <span className="loading loading-spinner loading-xs" />
    ) : (
      count
    );

  return (
    <div
      className="join join-vertical w-full sm:join-horizontal sm:w-auto"
      role="tablist"
      aria-label="検索結果の表示単位"
    >
      <button
        type="button"
        role="tab"
        aria-selected={view === "surveys"}
        className={`btn btn-sm join-item w-full justify-between sm:w-auto sm:justify-center ${view === "surveys" ? "btn-primary" : "btn-outline"}`}
        onClick={() => onViewChange("surveys")}
      >
        <span className="flex min-w-0 items-center gap-2">
          {renderIconByKind("stat")}
          <span className="truncate">統計調査</span>
        </span>
        <span className="badge badge-outline badge-sm">
          {renderCount(stat)}
        </span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "tables"}
        className={`btn btn-sm join-item w-full justify-between sm:w-auto sm:justify-center ${view === "tables" ? "btn-primary" : "btn-outline"}`}
        onClick={() => onViewChange("tables")}
      >
        <span className="flex min-w-0 items-center gap-2">
          {renderIconByKind("db")}
          <span className="truncate">統計データ</span>
        </span>
        <span className="badge badge-outline badge-sm">{renderCount(db)}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "metadata"}
        className={`btn btn-sm join-item w-full justify-between sm:w-auto sm:justify-center ${view === "metadata" ? "btn-primary" : "btn-outline"}`}
        onClick={() => onViewChange("metadata")}
      >
        <span className="flex min-w-0 items-center gap-2">
          {renderIconByKind("dimension")}
          <span className="truncate">メタデータ</span>
        </span>
        <span className="badge badge-outline badge-sm">
          {renderCount(metadata)}
        </span>
      </button>
    </div>
  );
}
