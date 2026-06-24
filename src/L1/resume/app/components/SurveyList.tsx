"use client";

import { useEffect, useRef } from "react";
import { toSurveyCardProps, type SurveyResult } from "../../lib/surveyResults";
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
        {searchResult.map((survey: SurveyResult) => {
          const cardProps = toSurveyCardProps(survey);

          return (
            <SurveyCard
              key={cardProps.statcode}
              {...cardProps}
              onSelect={() => selectSurvey(cardProps.statname)}
            />
          );
        })}
      </div>
    </InfiniteScrollContainer>
  );
}
