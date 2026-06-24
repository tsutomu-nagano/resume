"use client";

import { useEffect, useRef } from "react";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import { InfiniteScrollContainer } from "./InfiniteScrollContainer";
import { SurveyCard } from "./SurveyCard";

export default function SurveyList() {
  const {
    loading,
    error,
    fetchMore,
    searchResult,
    isLast,
    selectSurvey,
  } = useSearchItem();
  const didFetch = useRef(false);

  useEffect(() => {
    if (!didFetch.current) {
      didFetch.current = true;
      void fetchMore();
    }
  }, [fetchMore]);

  if (loading) {
    return <span className="loading loading-spinner text-primary" />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <InfiniteScrollContainer fetchMore={fetchMore} isLast={isLast}>
      <div className="flex flex-col gap-y-6">
        {searchResult.map(
          (survey: {
            statcode: string;
            statname: string;
            table_count?: { aggregate?: { count?: number } };
          }) => (
            <SurveyCard
              key={survey.statcode}
              statcode={survey.statcode}
              statname={survey.statname}
              tableCount={Number(survey.table_count?.aggregate?.count ?? 0)}
              onSelect={() => selectSurvey(survey.statname)}
            />
          )
        )}
      </div>
    </InfiniteScrollContainer>
  );
}
