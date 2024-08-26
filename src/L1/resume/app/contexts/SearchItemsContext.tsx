"use client"; // このファイルはクライアントサイドでのみ実行される

import React, { createContext, useState, ReactNode } from 'react';


// Contextの型定義
interface SearchItemContextType {
  items: Map<string, Set<string>>;
  getItemsArray: () => ({kind: string, itemName:string}[]);
  findItem: (kind:string, itemName:string) => boolean;
  addItem: (kind:string, itemName:string) => void;
  removeItem: (kind:string, itemName:string) => void;
  searchQuery: string;
}

// コンテキストの作成
export const SearchItemContext = createContext<SearchItemContextType | undefined>(undefined);


