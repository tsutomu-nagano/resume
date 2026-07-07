"use client"; // このファイルはクライアントサイドでのみ実行される

import { useRef, useEffect } from "react";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import { TableCard } from "./TableCard";
import { InfiniteScrollContainer } from "./InfiniteScrollContainer";
import { ResultSkeletons } from "./ResultSkeletons";

type TableResult = {
  statdispid: string;
  cycle: string;
  statcode: string;
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

  const didEffect = useRef(false);
  useEffect(() => {
    if (!didEffect.current && searchResult.length === 0 && !isLast) {
      didEffect.current = true;
      fetchMore();
    }
  }, [fetchMore, isLast, searchResult.length]);

  if (loading) return <ResultSkeletons view="tables" />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <InfiniteScrollContainer
      fetchMore={fetchMore}
      isLast={isLast}
      isFetchingMore={isFetchingMore}
    >
      <div className="flex flex-col gap-y-10">
        {searchResult.filter(isTableResult).map((tbl) => (
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
    </InfiniteScrollContainer>
  );
}
