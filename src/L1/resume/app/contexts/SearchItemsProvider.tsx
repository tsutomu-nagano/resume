"use client"; // このファイルはクライアントサイドでのみ実行される
import React, { useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { SearchItemContext } from './SearchItemsContext';

import { gql, useQuery } from "@apollo/client";
import { createApolloClient } from "@/lib/apolloClient";
import { GET_TABLE_LIST, GET_TABLE_LIST_COUNT } from '../../lib/queries';

interface SearchItemProviderProps {
  children: ReactNode;
}

export const SearchItemProvider = ({ children }: SearchItemProviderProps) => {


  const [offset, setOffset] = useState<number>(0);
  const [isLast, setIsLast] = useState(false);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [countResult, setCountResult] = useState<any>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [items, setItemSet] = useState<Map<string, Set<string>>>(new Map<string, Set<string>>());
  const limit: number = 5;

  const client = createApolloClient();


  const resetSearch = () => {
    setSearchResult([]);
    setOffset(0);
    setIsLast(false);
  };


  // 値を追加する関数
  const addItem = (kind: string, itemName: string, operator: string) => {
    resetSearch()
    setItemSet(prevSet => {
      const newSet = new Map(prevSet);
      const key = `${kind}:${operator}`;
      const currentItems = newSet.get(key) || new Set<string>();
      currentItems.add(itemName); // Set にアイテムを追加
      newSet.set(key, currentItems);
      return newSet;
    });
  };

  // 値を削除する関数
  const removeItem = (kind: string, itemName: string, operator: string) => {
    resetSearch()
    setItemSet(prevSet => {
      const newSet = new Map(prevSet);
      const key = `${kind}:${operator}`;
      const currentItems = newSet.get(key) || new Set<string>();
      currentItems.delete(itemName); // Set からアイテムを削除
      if (currentItems.size === 0) {
        newSet.delete(key); // Set が空になった場合、Map からも削除
      } else {
        newSet.set(key, currentItems); // 更新された Set を Map に保存
      }
      return newSet;
    });
  };

  // 値の存在を確認する確認
  const findItem = (kind: string, itemName: string, operator: string) => {
    const key = `${kind}:${operator}`;
    return (items.has(key) && items.get(key)?.has(itemName) || false)
  };

  // 検索アイテムを配列で返す関数
  const getItemsArray = (kind: string = ""): { kind: string, itemName: string, operator: string }[] => {

    let result: { kind: string, itemName: string, operator: string }[] = []

    if (kind === "") {
      result = Array.from(items.entries()).flatMap(([key, names]) => {
        const [kind, operator] = key.split(':');
        return Array.from(names).map(itemName => ({ kind, itemName, operator }))
      })

    } else {
      // This part needs to be updated to handle the operator
      // For now, it will only handle the _eq operator
      const items_of_kind_eq = items.get(`${kind}:_eq`);
      if (items_of_kind_eq) {
        result = Array.from(items_of_kind_eq).map(itemName => ({ kind, itemName, operator: '_eq' }))
      }
      const items_of_kind_neq = items.get(`${kind}:_neq`);
      if (items_of_kind_neq) {
        result = result.concat(Array.from(items_of_kind_neq).map(itemName => ({ kind, itemName, operator: '_neq' })))
      }
    }
    return (result)
  };

  const countQuery = useMemo(() => GET_TABLE_LIST_COUNT(items), [items]);
  const fetchCount = async () => {

    try {

      const query = countQuery;
      const result = await client.query({query});

      setCountResult(result.data.tablelist_aggregate.aggregate)

    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };


  const searchQuery = useMemo(() => GET_TABLE_LIST(items), [items]);

  const fetchMore = async () => {

    try {

      const query = searchQuery;
      const result = await client.query({
        query,
        variables: { limit_number: limit, offset_number: offset },
      });

      if (result.data.tablelist.length != 0) {
        setSearchResult(prevData => [...prevData, ...result.data.tablelist]);
        setOffset(prevOffSet => prevOffSet + limit)
      } else {
        setIsLast(true)
      }

    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCount();
  }, [items]); 

  return (
    <SearchItemContext.Provider
      value={{
        items,
        getItemsArray,
        findItem,
        addItem,
        removeItem,
        searchQuery,
        offset,
        setOffset,
        searchResult,
        countResult,
        loading,
        error,
        fetchMore,
        fetchCount,
        isLast
      }}
    >
      {children}
    </SearchItemContext.Provider>
  );
};


// Contextを利用するカスタムフック
export const useSearchItem = () => {
  const context = useContext(SearchItemContext);
  if (context === undefined) {
    throw new Error('useSearchItem must be used within a SearchItemProvider');
  }
  return context;
};