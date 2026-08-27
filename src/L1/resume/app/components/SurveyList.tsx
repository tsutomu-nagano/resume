"use client";

import { useEffect, useRef, useState } from "react";
import { List, Scale } from "lucide-react";
import {
  isSurveyResult,
  toSurveyCardProps,
  type SurveyResult,
} from "../../lib/surveyResults";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import { InfiniteScrollContainer } from "./InfiniteScrollContainer";
import { ResultSkeletons } from "./ResultSkeletons";
import { SurveyCard } from "./SurveyCard";
import { SurveyComparisonTable } from "./SurveyComparisonTable";

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
    getItemsArray,
  } = useSearchItem();
  const didFetch = useRef(false);
  const [selectedSurveyViewMode, setSelectedSurveyViewMode] = useState<
    "list" | "comparison"
  >("list");
  const selectedSurveyNames = getItemsArray("stat").map(
    ({ itemName }) => itemName,
  );
  const hasSelectedSurveys = selectedSurveyNames.length > 0;
  const surveyViewMode = hasSelectedSurveys ? selectedSurveyViewMode : "list";

  useEffect(() => {
    if (!didFetch.current && searchResult.length === 0 && !isLast) {
      didFetch.current = true;
      void fetchMore();
    }
  }, [fetchMore, isLast, searchResult.length]);

  useEffect(() => {
    if (!hasSelectedSurveys && selectedSurveyViewMode === "comparison") {
      setSelectedSurveyViewMode("list");
    }
  }, [hasSelectedSurveys, selectedSurveyViewMode]);

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
        <div
          className="join join-vertical w-full sm:join-horizontal sm:w-auto"
          role="tablist"
          aria-label="統計調査の表示形式"
        >
          <button
            type="button"
            role="tab"
            aria-selected={surveyViewMode === "list"}
            className={`btn btn-sm join-item justify-between gap-2 sm:justify-center ${
              surveyViewMode === "list" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setSelectedSurveyViewMode("list")}
          >
            <span className="flex items-center gap-2">
              <List className="size-4" />
              一覧
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={surveyViewMode === "comparison"}
            className={`btn btn-sm join-item justify-between gap-2 sm:justify-center ${
              surveyViewMode === "comparison" ? "btn-primary" : "btn-outline"
            }`}
            disabled={!hasSelectedSurveys}
            onClick={() => setSelectedSurveyViewMode("comparison")}
          >
            <span className="flex items-center gap-2">
              <Scale className="size-4" />
              比較
            </span>
            {hasSelectedSurveys ? (
              <span className="badge badge-outline badge-sm">
                {selectedSurveyNames.length}
              </span>
            ) : null}
          </button>
        </div>
        {surveyViewMode === "comparison" ? (
          <SurveyComparisonTable
            selectedSurveyNames={selectedSurveyNames}
            onRemoveSurvey={(surveyName) => removeItem("stat", surveyName)}
          />
        ) : (
          searchResult.filter(isSurveyResult).map((survey: SurveyResult) => {
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
          })
        )}
      </div>
    </InfiniteScrollContainer>
  );
}
