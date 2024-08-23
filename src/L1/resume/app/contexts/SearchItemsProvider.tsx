"use client"; // このファイルはクライアントサイドでのみ実行される

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {SearchItemContext} from './SearchItemsContext';

interface SearchItemProviderProps {
  children: ReactNode;
}

export const SearchItemProvider = ({ children }: SearchItemProviderProps) => {
  const [itemSet, setItemSet] = useState<Map<string, string>>(new Map<string,string>());
  const [query, setQuery] = useState<string>("");

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

  let statsCondition = "";
  let measuresCondition = "";
  let themasCondition = "";

  if (itemSet.size !== 0) {
    const measuresArray = Array.from(itemSet)
      .filter(item => item[1] === "measure")
      .map(item => `"${item[0]}"`);

    if (measuresArray.length > 0) {
      measuresCondition = `table_measures: { name: { _in: [${measuresArray.join(",")}] } } `;
    }

    const themasArray = Array.from(itemSet)
      .filter(item => item[1] === "thema")
      .map(item => `"${item[0]}"`);

    if (themasArray.length > 0) {
      themasCondition = `table_tags: { tag_name: { _in: [${themasArray.join(",")}] } } `;
    }

    const statsArray = Array.from(itemSet)
    .filter(item => item[1] === "stat")
    .map(item => `"${item[0]}"`);

    if (statsArray.length > 0) {
      statsCondition = `statlist: { statname: { _in: [${statsArray.join(",")}] } } `;
    }


  }
  
  const searchQuery = `
    query GetTableList {
      tablelist(where:{${measuresCondition} ${themasCondition} ${statsCondition}}, limit: 10) {
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
      }
    }
  `;


  return (
    <SearchItemContext.Provider value={{ itemSet, addItem, removeItem, searchQuery }}>
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