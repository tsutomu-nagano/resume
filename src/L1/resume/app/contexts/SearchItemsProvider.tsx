"use client"; // このファイルはクライアントサイドでのみ実行される

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {SearchItemContext} from './SearchItemsContext';

interface SearchItemProviderProps {
  children: ReactNode;
}

export const SearchItemProvider = ({ children }: SearchItemProviderProps) => {
  const [itemSet, setItemSet] = useState<Map<string, string>>(new Map<string,string>());

  // 値を追加する関数
  const addItem = (itemName: string, kind:string) => {
    setItemSet(prevSet => new Map(prevSet).set(itemName, kind));
  };

  // 値を削除する関数
  const removeItem = (user: string) => {
    setItemSet(prevSet => {
      const newSet = new Map(prevSet);
      newSet.delete(user);
      return newSet;
    });
  };

  return (
    <SearchItemContext.Provider value={{ itemSet, addItem, removeItem }}>
      {children}
    </SearchItemContext.Provider>
  );
};

// Contextを利用するカスタムフック
export const useSearchItem = () => {
  const context = useContext(SearchItemContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};