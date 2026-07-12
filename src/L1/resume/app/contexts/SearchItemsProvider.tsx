"use client";

import {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createApolloClient } from "@lib/apolloClient";
import {
  GET_SURVEY_ATTRIBUTE_STATCODES,
  GET_SURVEY_ATTRIBUTES,
  GET_METADATA_LIST,
  GET_SURVEY_LIST,
  GET_TABLE_LIST,
  GET_TABLE_LIST_COUNT,
} from "@lib/queries";
import {
  SearchHistoryItem,
  SearchHistoryNode,
  SearchItemContext,
  SearchResultView,
} from "./SearchItemsContext";

interface SearchItemProviderProps {
  children: ReactNode;
}

const RESULT_VIEW_PARAM = "view";
const SEARCH_HISTORY_STORAGE_KEY = "resume:git-style-search-history";
const ACTIVE_SEARCH_NODE_STORAGE_KEY = "resume:active-search-history-node";
const PAGE_SIZE = 5;
const NO_ATTRIBUTE_FILTER_MATCH = "__NO_ATTRIBUTE_FILTER_MATCH__";
const ATTRIBUTE_FILTERS = [
  { kind: "survey_unit", attributeCode: "survey_units" },
  { kind: "stat_kind", attributeCode: "stat_kind" },
] as const;

type SearchParamsReader = Pick<URLSearchParams, "forEach" | "get">;
type ResultCacheEntry = {
  searchResult: any[];
  offset: number;
  isLast: boolean;
};
type PendingResultCacheEntry = ResultCacheEntry & {
  key: string;
};

type SearchHistoryDraft = {
  nodes: SearchHistoryNode[];
  activeNodeId: string | null;
};

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

function cloneItems(items: Map<string, Set<string>>) {
  return new Map(
    Array.from(items.entries()).map(
      ([kind, values]) => [kind, new Set(values)] as const,
    ),
  );
}

function getItemsArrayFromMap(items: Map<string, Set<string>>) {
  return Array.from(items.entries()).flatMap(([kind, names]) =>
    Array.from(names).map((itemName) => ({ kind, itemName })),
  );
}

function getItemKey({ kind, itemName }: SearchHistoryItem) {
  return `${kind}:${itemName}`;
}

function uniqueItems(items: SearchHistoryItem[]) {
  const itemKeys = new Set<string>();

  return items.filter((item) => {
    const itemKey = getItemKey(item);

    if (itemKeys.has(itemKey)) {
      return false;
    }

    itemKeys.add(itemKey);
    return true;
  });
}

function getItemsMapFromArray(items: SearchHistoryItem[]) {
  const nextItems = new Map<string, Set<string>>();

  for (const { kind, itemName } of items) {
    const values = new Set(nextItems.get(kind) || []);
    values.add(itemName);
    nextItems.set(kind, values);
  }

  return nextItems;
}

function areItemsEqual(
  leftItems: Map<string, Set<string>>,
  rightItems: Map<string, Set<string>>,
) {
  return (
    getResultCacheKey("tables", leftItems) ===
    getResultCacheKey("tables", rightItems)
  );
}

function getAddedItems(
  parentItems: SearchHistoryItem[],
  nextItems: SearchHistoryItem[],
) {
  const parentItemKeys = new Set(parentItems.map((item) => getItemKey(item)));

  return uniqueItems(nextItems).filter(
    (item) => !parentItemKeys.has(getItemKey(item)),
  );
}

function getSearchNodeName(items: SearchHistoryItem[]) {
  if (items.length === 0) {
    return "条件なし";
  }

  return items
    .slice(0, 3)
    .map(({ itemName }) => itemName)
    .join(" AND ");
}

function getSearchExpression(items: SearchHistoryItem[]) {
  const itemsByKind = items.reduce<Record<string, string[]>>(
    (previousItems, { kind, itemName }) => {
      previousItems[kind] = [...(previousItems[kind] || []), itemName];
      return previousItems;
    },
    {},
  );

  return Object.values(itemsByKind)
    .map((values) => `(${values.join(" OR ")})`)
    .join(" AND ");
}

function createSearchNode({
  parentId,
  parentItems,
  items,
  resultCount,
  view,
}: {
  parentId: string | null;
  parentItems: SearchHistoryItem[];
  items: SearchHistoryItem[];
  resultCount: number | null;
  view: SearchResultView;
}): SearchHistoryNode {
  const now = new Date().toISOString();
  const uniqueNodeItems = uniqueItems(items);

  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    parentId,
    name: getSearchNodeName(uniqueNodeItems),
    items: uniqueNodeItems,
    addedItems: getAddedItems(parentItems, uniqueNodeItems),
    resultCount,
    view,
    createdAt: now,
    updatedAt: now,
    memo: getSearchExpression(items),
  };
}

function loadSearchHistory(): SearchHistoryDraft {
  if (typeof window === "undefined") {
    return { nodes: [], activeNodeId: null };
  }

  try {
    const nodes = JSON.parse(
      window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY) || "[]",
    );
    const activeNodeId = window.localStorage.getItem(
      ACTIVE_SEARCH_NODE_STORAGE_KEY,
    );

    if (!Array.isArray(nodes)) {
      return { nodes: [], activeNodeId: null };
    }

    return { nodes, activeNodeId };
  } catch {
    return { nodes: [], activeNodeId: null };
  }
}

function getResultView(searchParams: SearchParamsReader): SearchResultView {
  const view = searchParams.get(RESULT_VIEW_PARAM);

  if (view === "surveys" || view === "metadata") {
    return view;
  }

  return "tables";
}

function getResultCacheKey(
  view: SearchResultView,
  items: Map<string, Set<string>>,
) {
  const itemKey = Array.from(items.entries())
    .flatMap(([kind, values]) =>
      Array.from(values).map((value) => `${kind}=${value}`),
    )
    .sort()
    .join("&");

  return `${view}:${itemKey}`;
}

function getItemsWithoutKinds(
  items: Map<string, Set<string>>,
  kinds: string[],
) {
  const excludedKinds = new Set(kinds);

  return new Map(
    Array.from(items.entries())
      .filter(([kind]) => !excludedKinds.has(kind))
      .map(([kind, values]) => [kind, new Set(values)] as const),
  );
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
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [items, setItemSet] = useState<Map<string, Set<string>>>(() =>
    getItemsFromSearchParams(searchParams),
  );
  const [searchHistoryNodes, setSearchHistoryNodes] = useState<
    SearchHistoryNode[]
  >([]);
  const [activeSearchNodeId, setActiveSearchNodeId] = useState<string | null>(
    null,
  );
  const [hasLoadedSearchHistory, setHasLoadedSearchHistory] = useState(false);
  const resultCache = useRef(new Map<string, ResultCacheEntry>());

  const client = createApolloClient();
  const resultCacheKey = useMemo(
    () =>
      getResultCacheKey(
        view,
        view === "surveys" ? getItemsWithoutKinds(items, ["stat"]) : items,
      ),
    [items, view],
  );
  const activeResultCacheKey = useRef(resultCacheKey);
  const pendingResultCache = useRef<PendingResultCacheEntry | null>(null);

  useEffect(() => {
    const { nodes, activeNodeId } = loadSearchHistory();
    setSearchHistoryNodes(nodes);
    setActiveSearchNodeId(activeNodeId);
    setHasLoadedSearchHistory(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedSearchHistory) {
      return;
    }

    window.localStorage.setItem(
      SEARCH_HISTORY_STORAGE_KEY,
      JSON.stringify(searchHistoryNodes),
    );
  }, [hasLoadedSearchHistory, searchHistoryNodes]);

  useEffect(() => {
    if (!hasLoadedSearchHistory) {
      return;
    }

    if (activeSearchNodeId) {
      window.localStorage.setItem(
        ACTIVE_SEARCH_NODE_STORAGE_KEY,
        activeSearchNodeId,
      );
    } else {
      window.localStorage.removeItem(ACTIVE_SEARCH_NODE_STORAGE_KEY);
    }
  }, [activeSearchNodeId, hasLoadedSearchHistory]);

  useEffect(() => {
    activeResultCacheKey.current = resultCacheKey;

    if (pendingResultCache.current?.key !== resultCacheKey) {
      return;
    }

    const cachedResult = pendingResultCache.current;
    pendingResultCache.current = null;
    setSearchResult(cachedResult.searchResult);
    setOffset(cachedResult.offset);
    setIsLast(cachedResult.isLast);
    setError(null);
    setLoading(false);
    setIsFetchingMore(false);
  }, [resultCacheKey]);

  const rememberCurrentResults = () => {
    resultCache.current.set(resultCacheKey, {
      searchResult,
      offset,
      isLast,
    });
  };

  const resetSearch = () => {
    setSearchResult([]);
    setOffset(0);
    setIsLast(false);
    setError(null);
    setLoading(true);
    setIsFetchingMore(false);
  };

  const navigate = (params: URLSearchParams) => {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const navigateToItems = (
    nextItems: Map<string, Set<string>>,
    nextView: SearchResultView,
  ) => {
    const params = new URLSearchParams();

    for (const { kind, itemName } of getItemsArrayFromMap(nextItems)) {
      params.append(kind, itemName);
    }

    if (nextView !== "tables") {
      params.set(RESULT_VIEW_PARAM, nextView);
    }

    navigate(params);
  };

  const getActiveSearchNode = () =>
    searchHistoryNodes.find((node) => node.id === activeSearchNodeId) || null;

  const getCurrentResultCount = () => {
    if (view === "surveys") {
      return typeof countResult?.stat === "number" ? countResult.stat : null;
    }

    if (view === "tables") {
      return typeof countResult?.db === "number" ? countResult.db : null;
    }

    return null;
  };

  useEffect(() => {
    const resultCount = getCurrentResultCount();

    if (!activeSearchNodeId || resultCount === null) {
      return;
    }

    setSearchHistoryNodes((previousNodes) =>
      previousNodes.map((node) => {
        const isCurrentNode =
          node.id === activeSearchNodeId &&
          node.view === view &&
          areItemsEqual(getItemsMapFromArray(node.items), items);

        if (!isCurrentNode || node.resultCount === resultCount) {
          return node;
        }

        return {
          ...node,
          resultCount,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }, [activeSearchNodeId, countResult, items, view]);

  const commitSearchNode = () => {
    const itemsArray = getItemsArrayFromMap(items);
    const activeNode = getActiveSearchNode();

    if (
      activeNode &&
      areItemsEqual(getItemsMapFromArray(activeNode.items), items)
    ) {
      return;
    }

    const parentId = activeNode?.id || null;
    const parentItems = activeNode?.items || [];

    setSearchHistoryNodes((previousNodes) => {
      const duplicateNode = previousNodes.find(
        (node) =>
          node.parentId === parentId &&
          getResultCacheKey(node.view, getItemsMapFromArray(node.items)) ===
            getResultCacheKey(view, items),
      );

      if (duplicateNode) {
        setActiveSearchNodeId(duplicateNode.id);
        return previousNodes;
      }

      const nextNode = createSearchNode({
        parentId,
        parentItems,
        items: itemsArray,
        resultCount: getCurrentResultCount(),
        view,
      });

      setActiveSearchNodeId(nextNode.id);
      return [...previousNodes, nextNode];
    });
  };

  const updateSearchNodeConditions = (nodeId: string) => {
    const targetNode = searchHistoryNodes.find((node) => node.id === nodeId);

    if (!targetNode) {
      return;
    }

    const currentItems = getItemsArrayFromMap(items);
    const mergedItems = uniqueItems([...targetNode.items, ...currentItems]);
    const parentNode = targetNode.parentId
      ? searchHistoryNodes.find((node) => node.id === targetNode.parentId)
      : null;
    const parentItems = parentNode?.items || [];
    const mergedItemsMap = getItemsMapFromArray(mergedItems);
    const resultCount = areItemsEqual(mergedItemsMap, items)
      ? getCurrentResultCount()
      : null;

    setSearchHistoryNodes((previousNodes) =>
      previousNodes.map((node) =>
        node.id === targetNode.id
          ? {
              ...node,
              items: mergedItems,
              addedItems: getAddedItems(parentItems, mergedItems),
              resultCount: resultCount ?? node.resultCount,
              view,
              memo: getSearchExpression(mergedItems),
              updatedAt: new Date().toISOString(),
            }
          : node,
      ),
    );
  };

  const checkoutSearchNode = (nodeId: string) => {
    const node = searchHistoryNodes.find(
      (searchNode) => searchNode.id === nodeId,
    );

    if (!node) {
      return;
    }

    const nextItems = getItemsMapFromArray(node.items);
    rememberCurrentResults();
    resetSearch();
    setItemSet(nextItems);
    setActiveSearchNodeId(node.id);
    navigateToItems(nextItems, node.view);
  };

  const renameSearchNode = (nodeId: string, name: string) => {
    const nextName = name.trim();

    if (!nextName) {
      return;
    }

    setSearchHistoryNodes((previousNodes) =>
      previousNodes.map((node) =>
        node.id === nodeId
          ? { ...node, name: nextName, updatedAt: new Date().toISOString() }
          : node,
      ),
    );
  };

  const clearSearchHistory = () => {
    setSearchHistoryNodes([]);
    setActiveSearchNodeId(null);
  };

  const shouldResetSearchForItems = (nextItems: { kind: string }[]) =>
    !(view === "surveys" && nextItems.every(({ kind }) => kind === "stat"));

  const addItem = (kind: string, itemName: string) => {
    if (items.get(kind)?.has(itemName)) {
      return;
    }

    if (shouldResetSearchForItems([{ kind }])) {
      resetSearch();
    }

    setItemSet((previousItems) => {
      if (previousItems.get(kind)?.has(itemName)) {
        return previousItems;
      }

      const newItems = cloneItems(previousItems);
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

  const addItems = (nextItems: { kind: string; itemName: string }[]) => {
    const itemsToAdd = nextItems.filter(
      ({ kind, itemName }) => !items.get(kind)?.has(itemName),
    );

    if (itemsToAdd.length === 0) {
      return;
    }

    if (shouldResetSearchForItems(itemsToAdd)) {
      resetSearch();
    }

    setItemSet((previousItems) => {
      const newItems = cloneItems(previousItems);
      let hasChanged = false;

      for (const { kind, itemName } of itemsToAdd) {
        if (newItems.get(kind)?.has(itemName)) {
          continue;
        }

        const currentItems = new Set(newItems.get(kind) || []);
        currentItems.add(itemName);
        newItems.set(kind, currentItems);
        hasChanged = true;
      }

      if (!hasChanged) {
        return previousItems;
      }

      return newItems;
    });

    const params = new URLSearchParams(searchParams.toString());
    for (const { kind, itemName } of itemsToAdd) {
      if (!params.getAll(kind).includes(itemName)) {
        params.append(kind, itemName);
      }
    }
    navigate(params);
  };

  const removeItem = (kind: string, itemName: string) => {
    if (shouldResetSearchForItems([{ kind }])) {
      resetSearch();
    }

    setItemSet((previousItems) => {
      const newItems = cloneItems(previousItems);
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

    rememberCurrentResults();

    const nextResultCacheKey = getResultCacheKey(nextView, items);
    const cachedResult = resultCache.current.get(nextResultCacheKey);

    if (cachedResult) {
      pendingResultCache.current = {
        key: nextResultCacheKey,
        ...cachedResult,
      };
      resetSearch();
    } else {
      pendingResultCache.current = null;
      resetSearch();
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set(RESULT_VIEW_PARAM, nextView);
    navigate(params);
  };

  const selectSurvey = (surveyName: string) => {
    if (items.get("stat")?.has(surveyName)) {
      return;
    }

    resetSearch();
    setItemSet((previousItems) => {
      if (previousItems.get("stat")?.has(surveyName)) {
        return previousItems;
      }

      const newItems = cloneItems(previousItems);
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

  const searchQuery = useMemo(() => {
    if (view === "surveys") {
      return GET_SURVEY_LIST(getItemsWithoutKinds(items, ["stat"]));
    }

    if (view === "metadata") {
      return GET_METADATA_LIST(items);
    }

    return GET_TABLE_LIST(items);
  }, [items, view]);
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
      const metadataCount =
        Number(result.data.metadata_measures?.aggregate?.count ?? 0) +
        Number(result.data.metadata_dimensions?.aggregate?.count ?? 0) +
        Number(result.data.metadata_themes?.aggregate?.count ?? 0) +
        Number(result.data.metadata_regions?.aggregate?.count ?? 0) +
        Number(result.data.metadata_survey_units?.aggregate?.count ?? 0) +
        Number(result.data.metadata_stat_kinds?.aggregate?.count ?? 0);

      setCountResult({
        ...result.data.tablelist_aggregate.aggregate,
        metadata: metadataCount,
      });
    } catch (err) {
      setError(err as Error);
    }
  };

  const fetchMore = async () => {
    if (isFetchingMore) {
      return;
    }

    const requestResultCacheKey = resultCacheKey;
    const isCurrentRequest = () =>
      activeResultCacheKey.current === requestResultCacheKey;
    const isInitialFetch = searchResult.length === 0 && offset === 0;
    setLoading(isInitialFetch);
    setIsFetchingMore(!isInitialFetch);

    try {
      const resolvedItems = await resolveSurveyAttributeItems();
      const query =
        view === "surveys"
          ? GET_SURVEY_LIST(getItemsWithoutKinds(resolvedItems, ["stat"]))
          : view === "metadata"
            ? GET_METADATA_LIST(resolvedItems)
            : GET_TABLE_LIST(resolvedItems);
      const result = await client.query({
        ...query,
        variables: {
          ...query.variables,
          limit_number: PAGE_SIZE,
          offset_number: offset,
        },
      });
      if (!isCurrentRequest()) {
        return;
      }

      const metadataResults =
        view === "metadata"
          ? [
              ...((result.data.measures || []) as { name: string }[]).map(
                (item) => ({ ...item, kind: "measure" }),
              ),
              ...((result.data.dimensions || []) as { name: string }[]).map(
                (item) => ({ ...item, kind: "dimension" }),
              ),
              ...((result.data.themes || []) as { name: string }[]).map(
                (item) => ({ ...item, kind: "thema" }),
              ),
              ...((result.data.regions || []) as { name: string }[]).map(
                (item) => ({ ...item, kind: "region" }),
              ),
              ...((result.data.surveyUnits || []) as { name: string }[]).map(
                (item) => ({ ...item, kind: "survey_unit" }),
              ),
              ...((result.data.statKinds || []) as { name: string }[]).map(
                (item) => ({ ...item, kind: "stat_kind" }),
              ),
            ]
          : [];
      const resultKey = view === "surveys" ? "surveylist" : "tablelist";
      const idKey =
        view === "surveys"
          ? "statcode"
          : view === "metadata"
            ? "metadataId"
            : "statdispid";
      const nextResults =
        view === "metadata" ? metadataResults : result.data[resultKey] || [];

      if (nextResults.length === 0) {
        setIsLast(true);
        resultCache.current.set(requestResultCacheKey, {
          searchResult,
          offset,
          isLast: true,
        });
        return;
      }

      let enrichedResults = nextResults;

      if (view === "metadata") {
        enrichedResults = nextResults.map(
          (item: { kind: string; name: string }) => ({
            ...item,
            metadataId: `${item.kind}:${item.name}`,
          }),
        );
      }

      if (view === "surveys") {
        const statcodes = nextResults.map(
          (survey: { statcode: string }) => survey.statcode,
        );

        try {
          const attributesResult = await client.query(
            GET_SURVEY_ATTRIBUTES(statcodes),
          );

          if (!isCurrentRequest()) {
            return;
          }

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
        const nextSearchResult = [
          ...previousResults,
          ...enrichedResults.filter(
            (item: Record<string, unknown>) => !existingIds.has(item[idKey]),
          ),
        ];

        resultCache.current.set(requestResultCacheKey, {
          searchResult: nextSearchResult,
          offset: offset + PAGE_SIZE,
          isLast,
        });

        return nextSearchResult;
      });
      setOffset((previousOffset) => previousOffset + PAGE_SIZE);
    } catch (err) {
      if (!isCurrentRequest()) {
        return;
      }

      setError(err as Error);
    } finally {
      if (isCurrentRequest()) {
        setLoading(false);
        setIsFetchingMore(false);
      }
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
        addItems,
        removeItem,
        selectSurvey,
        view,
        setView,
        searchQuery,
        searchHistoryNodes,
        activeSearchNodeId,
        commitSearchNode,
        updateSearchNodeConditions,
        checkoutSearchNode,
        renameSearchNode,
        clearSearchHistory,
        offset,
        setOffset,
        searchResult,
        countResult,
        loading,
        isFetchingMore,
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
