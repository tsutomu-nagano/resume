"use client";

import type { GraphQLRequest } from "@/lib/queries";
import type { DimensionSearchMode } from "@/lib/queries";
import { createContext } from "react";

export type SearchResultView = "tables" | "surveys" | "metadata";

export type SearchHistoryItem = { kind: string; itemName: string };

export type SearchHistoryNode = {
  id: string;
  parentId: string | null;
  name: string;
  items: SearchHistoryItem[];
  addedItems: SearchHistoryItem[];
  resultCount: number | null;
  view: SearchResultView;
  createdAt: string;
  updatedAt: string;
  memo: string;
};

interface SearchItemContextType {
  items: Map<string, Set<string>>;
  getItemsArray: (kind?: string) => { kind: string; itemName: string }[];
  findItem: (kind: string, itemName: string) => boolean;
  addItem: (kind: string, itemName: string) => void;
  addItems: (nextItems: { kind: string; itemName: string }[]) => void;
  removeItem: (kind: string, itemName: string) => void;
  selectSurvey: (surveyName: string) => void;

  view: SearchResultView;
  setView: (view: SearchResultView) => void;
  metadataSearchTerm: string;
  setMetadataSearchTerm: (searchTerm: string) => void;
  dimensionSearchMode: DimensionSearchMode;
  setDimensionSearchMode: (searchMode: DimensionSearchMode) => void;
  searchQuery: GraphQLRequest;
  searchHistoryNodes: SearchHistoryNode[];
  activeSearchNodeId: string | null;
  commitSearchNode: () => void;
  updateSearchNodeConditions: (nodeId: string) => void;
  checkoutSearchNode: (nodeId: string) => void;
  renameSearchNode: (nodeId: string, name: string) => void;
  clearSearchHistory: () => void;

  offset: number;
  setOffset: (offset: number) => void;

  fetchMore: () => Promise<void>;
  fetchCount: () => Promise<void>;
  isLast: boolean;
  searchResult: any[];
  countResult: any;
  loading: boolean;
  isFetchingMore: boolean;
  error: Error | null;
}

export const SearchItemContext = createContext<
  SearchItemContextType | undefined
>(undefined);
