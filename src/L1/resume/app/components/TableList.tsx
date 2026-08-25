"use client";

import { FolderTree, LayoutList } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import { InfiniteScrollContainer } from "./InfiniteScrollContainer";
import { ResultSkeletons } from "./ResultSkeletons";
import { TableCard } from "./TableCard";
import { TableExplorer, type TableThemeSurveyResult } from "./TableExplorer";

type TableResult = {
  statdispid: string;
  cycle: string;
  statcode: string;
  survey?: {
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

function isTableThemeSurveyResult(
  value: unknown,
): value is TableThemeSurveyResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const themeSurvey = value as Partial<TableThemeSurveyResult>;

  return (
    themeSurvey.kind === "themeSurvey" &&
    typeof themeSurvey.statcode === "string" &&
    typeof themeSurvey.statname === "string"
  );
}

export default function TableList() {
  const {
    loading,
    error,
    fetchMore,
    searchResult,
    isLast,
    isFetchingMore,
    tableResultMode,
    setTableResultMode,
  } = useSearchItem();

  const didEffect = useRef(false);
  useEffect(() => {
    didEffect.current = false;
  }, [tableResultMode]);

  useEffect(() => {
    if (!didEffect.current && searchResult.length === 0 && !isLast) {
      didEffect.current = true;
      fetchMore();
    }
  }, [fetchMore, isLast, searchResult.length, tableResultMode]);

  if (loading) return <ResultSkeletons view="tables" />;
  if (error) return <p>Error: {error.message}</p>;

  const tables = searchResult.filter(isTableResult);
  const themeSurveys = searchResult.filter(isTableThemeSurveyResult);

  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <div className="join" role="tablist" aria-label="統計データの表示方法">
          <button
            type="button"
            role="tab"
            aria-selected={tableResultMode === "cards"}
            className={`btn btn-sm join-item ${tableResultMode === "cards" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTableResultMode("cards")}
          >
            <LayoutList className="size-4" />
            カード
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tableResultMode === "themes"}
            className={`btn btn-sm join-item ${tableResultMode === "themes" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTableResultMode("themes")}
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
          {tableResultMode === "themes" ? (
            <TableExplorer surveys={themeSurveys} />
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
                  statname={tbl.survey?.statname}
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
