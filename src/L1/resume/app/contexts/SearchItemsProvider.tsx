"use client";

import { ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createApolloClient } from "@lib/apolloClient";
import {
  GET_SURVEY_ATTRIBUTE_STATCODES,
  GET_SURVEY_ATTRIBUTES,
  GET_SURVEY_LIST,
  GET_TABLE_LIST,
  GET_TABLE_LIST_COUNT,
} from "@lib/queries";
import { SearchItemContext, SearchResultView } from "./SearchItemsContext";

interface SearchItemProviderProps {
  children: ReactNode;
}

const RESULT_VIEW_PARAM = "view";
const PAGE_SIZE = 5;
const NO_ATTRIBUTE_FILTER_MATCH = "__NO_ATTRIBUTE_FILTER_MATCH__";
const ATTRIBUTE_FILTERS = [
  { kind: "survey_unit", attributeCode: "survey_units" },
  { kind: "stat_kind", attributeCode: "stat_kind" },
] as const;

type SearchParamsReader = Pick<URLSearchParams, "forEach" | "get">;

function getItemsFromSearchParams(searchParams: SearchParamsReader) {
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

function getResultView(searchParams: SearchParamsReader): SearchResultView {
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
    getItemsFromSearchParams(searchParams),
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
      Array.from(names).map((itemName) => ({ kind: itemKind, itemName })),
    );
  };

  const searchQuery = useMemo(
    () => (view === "surveys" ? GET_SURVEY_LIST(items) : GET_TABLE_LIST(items)),
    [items, view],
  );
  const countQuery = useMemo(() => GET_TABLE_LIST_COUNT(items), [items]);

  const resolveSurveyAttributeItems = async () => {
    const activeFilters = ATTRIBUTE_FILTERS.filter(
      ({ kind }) => (items.get(kind)?.size || 0) > 0,
    );

    if (activeFilters.length === 0) {
      return items;
    }

    const excludedKinds: string[] = activeFilters.map(({ kind }) => kind);
    const statcodeSets = await Promise.all(
      activeFilters.map(async ({ kind, attributeCode }) => {
        const values = Array.from(items.get(kind) || []);
        const result = await client.query(
          GET_SURVEY_ATTRIBUTE_STATCODES(
            attributeCode,
            values,
            items,
            excludedKinds,
          ),
        );

        return new Set<string>(
          (result.data.items || []).map(
            (item: { statcode: string }) => item.statcode,
          ),
        );
      }),
    );

    const [firstSet, ...remainingSets] = statcodeSets;
    const statcodes = new Set<string>(
      Array.from(firstSet || []).filter((statcode) =>
        remainingSets.every((set) => set.has(statcode)),
      ),
    );
    const resolvedItems: Map<string, Set<string>> = new Map(
      Array.from(items.entries())
        .filter(([kind]) => !excludedKinds.includes(kind))
        .map(([kind, values]) => [kind, new Set(values)] as const),
    );

    resolvedItems.set(
      "statcode",
      statcodes.size > 0
        ? statcodes
        : new Set<string>([NO_ATTRIBUTE_FILTER_MATCH]),
    );

    return resolvedItems;
  };

  const fetchCount = async () => {
    try {
      const resolvedItems = await resolveSurveyAttributeItems();
      const result = await client.query(GET_TABLE_LIST_COUNT(resolvedItems));
      setCountResult(result.data.tablelist_aggregate.aggregate);
    } catch (err) {
      setError(err as Error);
    }
  };

  const fetchMore = async () => {
    try {
      const resolvedItems = await resolveSurveyAttributeItems();
      const query =
        view === "surveys"
          ? GET_SURVEY_LIST(resolvedItems)
          : GET_TABLE_LIST(resolvedItems);
      const result = await client.query({
        ...query,
        variables: {
          ...query.variables,
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

      let enrichedResults = nextResults;

      if (view === "surveys") {
        const statcodes = nextResults.map(
          (survey: { statcode: string }) => survey.statcode,
        );

        try {
          const attributesResult = await client.query(
            GET_SURVEY_ATTRIBUTES(statcodes),
          );
          const attributesByStatcode = new Map<string, unknown[]>();

          for (const attribute of attributesResult.data.attributes || []) {
            const currentAttributes =
              attributesByStatcode.get(attribute.statcode) || [];
            currentAttributes.push(attribute);
            attributesByStatcode.set(attribute.statcode, currentAttributes);
          }

          enrichedResults = nextResults.map((survey: { statcode: string }) => ({
            ...survey,
            attributes: attributesByStatcode.get(survey.statcode) || [],
          }));
        } catch {
          // Survey results remain useful even when optional descriptions are unavailable.
        }
      }

      setSearchResult((previousResults) => {
        const existingIds = new Set(previousResults.map((item) => item[idKey]));
        return [
          ...previousResults,
          ...enrichedResults.filter(
            (item: Record<string, unknown>) => !existingIds.has(item[idKey]),
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
