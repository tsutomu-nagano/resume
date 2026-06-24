"use client";

import { ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createApolloClient } from "@/lib/apolloClient";
import {
  GET_SURVEY_LIST,
  GET_TABLE_LIST,
  GET_TABLE_LIST_COUNT,
} from "@/lib/queries";
import {
  SearchItemContext,
  SearchResultView,
} from "./SearchItemsContext";

interface SearchItemProviderProps {
  children: ReactNode;
}

const RESULT_VIEW_PARAM = "view";
const PAGE_SIZE = 5;

function getItemsFromSearchParams(searchParams: URLSearchParams) {
  const newItems = new Map<string, Set<string>>();

  searchParams.forEach((value, key) => {
    if (key === RESULT_VIEW_PARAM) {
      return;
    }

    const currentItems = newItems.get(key) || new Set<string>();
    currentItems.add(value);
    newItems.set(key, currentItems);
  });

  return newItems;
}

function getResultView(searchParams: URLSearchParams): SearchResultView {
  return searchParams.get(RESULT_VIEW_PARAM) === "surveys"
    ? "surveys"
    : "tables";
}

export const SearchItemProvider = ({ children }: SearchItemProviderProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = getResultView(searchParams);

  const [offset, setOffset] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [countResult, setCountResult] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [items, setItemSet] = useState<Map<string, Set<string>>>(() =>
    getItemsFromSearchParams(searchParams)
  );

  const client = createApolloClient();

  const resetSearch = () => {
    setSearchResult([]);
    setOffset(0);
    setIsLast(false);
    setError(null);
    setLoading(true);
  };

  const navigate = (params: URLSearchParams) => {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const addItem = (kind: string, itemName: string) => {
    resetSearch();
    setItemSet((previousItems) => {
      const newItems = new Map(previousItems);
      const currentItems = new Set(newItems.get(kind) || []);
      currentItems.add(itemName);
      newItems.set(kind, currentItems);
      return newItems;
    });

    const params = new URLSearchParams(searchParams.toString());
    if (!params.getAll(kind).includes(itemName)) {
      params.append(kind, itemName);
    }
    navigate(params);
  };

  const removeItem = (kind: string, itemName: string) => {
    resetSearch();
    setItemSet((previousItems) => {
      const newItems = new Map(previousItems);
      const currentItems = new Set(newItems.get(kind) || []);
      currentItems.delete(itemName);

      if (currentItems.size === 0) {
        newItems.delete(kind);
      } else {
        newItems.set(kind, currentItems);
      }

      return newItems;
    });

    const params = new URLSearchParams(searchParams.toString());
    const values = params.getAll(kind).filter((value) => value !== itemName);
    params.delete(kind);
    values.forEach((value) => params.append(kind, value));
    navigate(params);
  };

  const setView = (nextView: SearchResultView) => {
    if (nextView === view) {
      return;
    }

    resetSearch();
    const params = new URLSearchParams(searchParams.toString());
    params.set(RESULT_VIEW_PARAM, nextView);
    navigate(params);
  };

  const selectSurvey = (surveyName: string) => {
    resetSearch();
    setItemSet((previousItems) => {
      const newItems = new Map(previousItems);
      const surveys = new Set(newItems.get("stat") || []);
      surveys.add(surveyName);
      newItems.set("stat", surveys);
      return newItems;
    });

    const params = new URLSearchParams(searchParams.toString());
    if (!params.getAll("stat").includes(surveyName)) {
      params.append("stat", surveyName);
    }
    params.set(RESULT_VIEW_PARAM, "tables");
    navigate(params);
  };

  const findItem = (kind: string, itemName: string) =>
    items.get(kind)?.has(itemName) || false;

  const getItemsArray = (kind = "") => {
    if (kind !== "") {
      return Array.from(items.get(kind) || []).map((itemName) => ({
        kind,
        itemName,
      }));
    }

    return Array.from(items.entries()).flatMap(([itemKind, names]) =>
      Array.from(names).map((itemName) => ({ kind: itemKind, itemName }))
    );
  };

  const countQuery = useMemo(() => GET_TABLE_LIST_COUNT(items), [items]);
  const searchQuery = useMemo(
    () => (view === "surveys" ? GET_SURVEY_LIST(items) : GET_TABLE_LIST(items)),
    [items, view]
  );

  const fetchCount = async () => {
    try {
      const result = await client.query(countQuery);
      setCountResult(result.data.tablelist_aggregate.aggregate);
    } catch (err) {
      setError(err as Error);
    }
  };

  const fetchMore = async () => {
    try {
      const result = await client.query({
        ...searchQuery,
        variables: {
          ...searchQuery.variables,
          limit_number: PAGE_SIZE,
          offset_number: offset,
        },
      });
      const resultKey = view === "surveys" ? "surveylist" : "tablelist";
      const idKey = view === "surveys" ? "statcode" : "statdispid";
      const nextResults = result.data[resultKey] || [];

      if (nextResults.length === 0) {
        setIsLast(true);
        return;
      }

      setSearchResult((previousResults) => {
        const existingIds = new Set(previousResults.map((item) => item[idKey]));
        return [
          ...previousResults,
          ...nextResults.filter((item: Record<string, unknown>) =>
            !existingIds.has(item[idKey])
          ),
        ];
      });
      setOffset((previousOffset) => previousOffset + PAGE_SIZE);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCount();
  }, [countQuery]);

  return (
    <SearchItemContext.Provider
      value={{
        items,
        getItemsArray,
        findItem,
        addItem,
        removeItem,
        selectSurvey,
        view,
        setView,
        searchQuery,
        offset,
        setOffset,
        searchResult,
        countResult,
        loading,
        error,
        fetchMore,
        fetchCount,
        isLast,
      }}
    >
      {children}
    </SearchItemContext.Provider>
  );
};

export const useSearchItem = () => {
  const context = useContext(SearchItemContext);

  if (context === undefined) {
    throw new Error("useSearchItem must be used within a SearchItemProvider");
  }

  return context;
};
