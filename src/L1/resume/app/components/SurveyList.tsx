"use client";

import { useEffect, useRef } from "react";
import {
  isSurveyResult,
  toSurveyCardProps,
  type SurveyResult,
} from "../../lib/surveyResults";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import { InfiniteScrollContainer } from "./InfiniteScrollContainer";
import { ResultSkeletons } from "./ResultSkeletons";
import { SurveyCard } from "./SurveyCard";

export default function SurveyList() {
  const {
    loading,
    error,
    fetchMore,
    searchResult,
    isLast,
    isFetchingMore,
    addItem,
    findItem,
    removeItem,
  } = useSearchItem();
  const didFetch = useRef(false);

  useEffect(() => {
    if (!didFetch.current && searchResult.length === 0 && !isLast) {
      didFetch.current = true;
      void fetchMore();
    }
  }, [fetchMore, isLast, searchResult.length]);

  if (loading) {
    return <ResultSkeletons view="surveys" />;
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
      <div className="flex flex-col gap-y-6">
        {searchResult.filter(isSurveyResult).map((survey: SurveyResult) => {
          const cardProps = toSurveyCardProps(survey);
          const isSelected = findItem("stat", cardProps.statname);

          return (
            <SurveyCard
              key={cardProps.statcode}
              {...cardProps}
              isSelected={isSelected}
              onToggle={() => {
                if (isSelected) {
                  removeItem("stat", cardProps.statname);
                } else {
                  addItem("stat", cardProps.statname);
                }
              }}
              onDeselect={() => removeItem("stat", cardProps.statname)}
            />
          );
        })}
      </div>
    </InfiniteScrollContainer>
  );
}
