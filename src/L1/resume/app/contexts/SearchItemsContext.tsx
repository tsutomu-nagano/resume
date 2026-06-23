"use client"; // このファイルはクライアントサイドでのみ実行される

import type { GraphQLRequest } from '@/lib/queries';
import { createContext } from 'react';


// Contextの型定義
interface SearchItemContextType {
  items: Map<string, Set<string>>;
  getItemsArray: (kind?: string) => ({kind: string, itemName:string}[]);
  findItem: (kind:string, itemName:string) => boolean;
  addItem: (kind:string, itemName:string) => void;
  removeItem: (kind:string, itemName:string) => void;

  searchQuery: GraphQLRequest;

  offset: number;
  setOffset: (offset:number) => void;

  fetchMore: () => Promise<void>;
  fetchCount: () => Promise<void>;
  isLast: boolean;
  searchResult: any[];
  countResult: any;
  loading: boolean
  error: Error | null;

}

// コンテキストの作成
export const SearchItemContext = createContext<SearchItemContextType | undefined>(undefined);


