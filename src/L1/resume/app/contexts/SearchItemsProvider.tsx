"use client"; // このファイルはクライアントサイドでのみ実行される

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SearchItemContext } from './SearchItemsContext';
import { BuilderCondition } from "./BuilderCondition"


interface SearchItemProviderProps {
  children: ReactNode;
}

export const SearchItemProvider = ({ children }: SearchItemProviderProps) => {
  const [items, setItemSet] = useState<Map<string, Set<string>>>(new Map<string,Set<string>>());

  // 値を追加する関数
  const addItem = (kind: string, itemName: string) => {
    setItemSet(prevSet => {
      const newSet = new Map(prevSet);
      const currentItems = newSet.get(kind) || new Set<string>();
      currentItems.add(itemName); // Set にアイテムを追加
      newSet.set(kind, currentItems);
      return newSet;
    });
  };

  // 値を削除する関数
  const removeItem = (kind: string, itemName: string) => {
    setItemSet(prevSet => {
      const newSet = new Map(prevSet);
      const currentItems = newSet.get(kind) || new Set<string>();
      currentItems.delete(itemName); // Set からアイテムを削除
      if (currentItems.size === 0) {
        newSet.delete(kind); // Set が空になった場合、Map からも削除
      } else {
        newSet.set(kind, currentItems); // 更新された Set を Map に保存
      }
      return newSet;
    });
  };

  // 値の存在を確認する確認
  const findItem = (kind: string, itemName: string) => {
    return(items.has(kind) && items.get(kind)?.has(itemName) || false)
  };

  // 検索アイテムを配列で返す関数
  const getItemsArray = (): { kind: string, itemName: string }[] => {
    return Array.from(items.entries()).flatMap(([kind, names]) => 
      Array.from(names).map(itemName => ({ kind, itemName }))
    );
  };

  const searchCondition = BuilderCondition(items);  
  
  const searchQuery = `
    query GetTableList {
      tablelist(where:{${searchCondition}}, limit: 10) {
        statdispid
        cycle
        statcode
        survey_date
        title
        table_tags {
          tag_name
        }
        table_measures {
          name
        }
        table_dimensions {
          class_name
        }
      }
    }
  `;


  return (
    <SearchItemContext.Provider value={{items, getItemsArray, findItem, addItem, removeItem, searchQuery }}>
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