"use client"; // このファイルはクライアントサイドでのみ実行される

import React, { createContext, useState, ReactNode } from 'react';


// Contextの型定義
interface SearchItemContextType {
  itemSet: Map<string, string>;
  addItem: (itemName:string, kind:string) => void;
  removeItem: (itemName:string) => void;
  searchQuery: string;
}

// コンテキストの作成
export const SearchItemContext = createContext<SearchItemContextType | undefined>(undefined);


