"use client";

import { renderIconByKind } from "../common/convertor";
import type { SearchResultView } from "../contexts/SearchItemsContext";

interface SearchCountResultProps {
  stat: number;
  db: number;
  view: SearchResultView;
  onViewChange: (view: SearchResultView) => void;
}

export function SearchCountResult({
  stat,
  db,
  view,
  onViewChange,
}: SearchCountResultProps) {
  return (
    <div className="join" role="tablist" aria-label="検索結果の表示単位">
      <button
        type="button"
        role="tab"
        aria-selected={view === "surveys"}
        className={`btn btn-sm join-item ${view === "surveys" ? "btn-primary" : "btn-outline"}`}
        onClick={() => onViewChange("surveys")}
      >
        {renderIconByKind("stat")}
        統計調査
        <span className="badge badge-outline badge-sm">{stat}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "tables"}
        className={`btn btn-sm join-item ${view === "tables" ? "btn-primary" : "btn-outline"}`}
        onClick={() => onViewChange("tables")}
      >
        {renderIconByKind("db")}
        統計データ
        <span className="badge badge-outline badge-sm">{db}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "metadata"}
        className={`btn btn-sm join-item ${view === "metadata" ? "btn-primary" : "btn-outline"}`}
        onClick={() => onViewChange("metadata")}
      >
        {renderIconByKind("dimension")}
        メタデータ
      </button>
    </div>
  );
}
