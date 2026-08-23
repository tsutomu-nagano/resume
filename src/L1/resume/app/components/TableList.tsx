"use client"; // このファイルはクライアントサイドでのみ実行される

import { LayoutList, FolderTree } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import { TableCard } from "./TableCard";
import { InfiniteScrollContainer } from "./InfiniteScrollContainer";
import { ResultSkeletons } from "./ResultSkeletons";
import { TableExplorer } from "./TableExplorer";

type TableResult = {
  statdispid: string;
  cycle: string;
  statcode: string;
  survey?: {
    statname?: string;
  };
  statlist?: {
    statname?: string;
  };
  survey_date: string;
  title: string;
  year_s: string;
  year_e: string;
  table_tags: { tag_name: string }[];
  table_measures: { name: string }[];
  table_dimensions: { class_name: string }[];
  table_regions: { regiontype: string }[];
};

function isTableResult(value: unknown): value is TableResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const table = value as Partial<TableResult>;

  return (
    typeof table.statdispid === "string" && typeof table.title === "string"
  );
}

export default function TableList() {
  const { loading, error, fetchMore, searchResult, isLast, isFetchingMore } =
    useSearchItem();
  const [displayMode, setDisplayMode] = useState<"cards" | "explorer">("cards");

  const didEffect = useRef(false);
  useEffect(() => {
    if (!didEffect.current && searchResult.length === 0 && !isLast) {
      didEffect.current = true;
      fetchMore();
    }
  }, [fetchMore, isLast, searchResult.length]);

  if (loading) return <ResultSkeletons view="tables" />;
  if (error) return <p>Error: {error.message}</p>;

  const tables = searchResult.filter(isTableResult);

  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <div className="join" role="tablist" aria-label="統計データの表示方法">
          <button
            type="button"
            role="tab"
            aria-selected={displayMode === "cards"}
            className={`btn btn-sm join-item ${displayMode === "cards" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setDisplayMode("cards")}
          >
            <LayoutList className="size-4" />
            カード
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={displayMode === "explorer"}
            className={`btn btn-sm join-item ${displayMode === "explorer" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setDisplayMode("explorer")}
          >
            <FolderTree className="size-4" />
            フォルダ
          </button>
        </div>
      </div>
      <InfiniteScrollContainer
        fetchMore={fetchMore}
        isLast={isLast}
        isFetchingMore={isFetchingMore}
      >
        <div className="transition-opacity duration-150">
          {displayMode === "explorer" ? (
            <TableExplorer tables={tables} />
          ) : (
            <div className="flex flex-col gap-y-10">
              {tables.map((tbl) => (
                <TableCard
                  key={tbl.statdispid}
                  statdispid={tbl.statdispid}
                  title={tbl.title}
                  year_s={tbl.year_s}
                  year_e={tbl.year_e}
                  cycle={tbl.cycle}
                  statcode={tbl.statcode}
                  survey_date={tbl.survey_date}
                  tags={tbl.table_tags}
                  measures={tbl.table_measures}
                  dimensions={tbl.table_dimensions}
                  regions={tbl.table_regions}
                />
              ))}
            </div>
          )}
        </div>
      </InfiniteScrollContainer>
    </div>
  );
}
