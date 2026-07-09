"use client";

import type { GraphQLRequest } from "@/lib/queries";
import { createContext } from "react";

export type SearchResultView = "tables" | "surveys" | "metadata";

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
  searchQuery: GraphQLRequest;

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
