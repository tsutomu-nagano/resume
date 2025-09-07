"use client"; // このファイルはクライアントサイドでのみ実行される
import React, { useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import { gql, useQuery } from "@apollo/client";
import { createApolloClient } from "@/lib/apolloClient";

import { SearchItemContext } from './SearchItemsContext';
import { GET_TABLE_LIST, GET_TABLE_LIST_COUNT } from '../../lib/queries';


interface SearchItemProviderProps {
  children: ReactNode;
}

export const SearchItemProvider = ({ children }: SearchItemProviderProps) => {

  // URLの検索条件を設定する関数
  function SetItemsFromURL() {

    // resetSearch()
    const newItems = new Map<string, Set<string>>();

    searchParams.forEach((value, key) => {
      const currentItems = new Set<string>([value]);
      newItems.set(key, currentItems);
    });

    return(newItems)
  }


  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [offset, setOffset] = useState<number>(0);
  const [isLast, setIsLast] = useState(false);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [countResult, setCountResult] = useState<any>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [items, setItemSet] = useState<Map<string, Set<string>>>(SetItemsFromURL);
  const limit: number = 5;

  const client = createApolloClient();


  const resetSearch = () => {
    setSearchResult([]);
    setOffset(0);
    setIsLast(false);
  };



  // 値を追加する関数
  const addItem = (kind: string, itemName: string) => {
    resetSearch()
    setItemSet(prevSet => {
      const newSet = new Map(prevSet);
      const currentItems = newSet.get(kind) || new Set<string>();
      currentItems.add(itemName); // Set にアイテムを追加
      newSet.set(kind, currentItems);
      return newSet;
    })
    const params = new URLSearchParams(searchParams.toString());
    const existingValues = params.getAll(kind);

    if (!existingValues.includes(itemName)) {
      params.append(kind, itemName);
    }

    router.push(`${pathname}?${params.toString()}`);
    ;
  };

  // 値を削除する関数
  const removeItem = (kind: string, itemName: string) => {
    resetSearch()
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
    })
    const params = new URLSearchParams(searchParams.toString());
    const values = params.getAll(kind).filter(v => v !== itemName);
    params.delete(kind);
    values.forEach(v => params.append(kind, v));
    router.push(`${pathname}?${params.toString()}`);
  };

  // 値の存在を確認する確認
  const findItem = (kind: string, itemName: string) => {
    return (items.has(kind) && items.get(kind)?.has(itemName) || false)
  };

  // 検索アイテムを配列で返す関数
  const getItemsArray = (kind: string = ""): { kind: string, itemName: string }[] => {

    let result: { kind: string, itemName: string }[] = []

    if (kind === "") {
      result = Array.from(items.entries()).flatMap(([kind_, names]) =>
        Array.from(names).map(itemName => ({ kind: kind_, itemName })))

    } else {
      const items_of_kind = items.get(kind);

      if (items_of_kind) {
        result = Array.from(items_of_kind).map(itemName => ({ kind, itemName }))
      }

    }
    return (result)
  };

  const countQuery = useMemo(() => GET_TABLE_LIST_COUNT(items), [items]);
  const fetchCount = async () => {

    try {

      const query = countQuery;
      const result = await client.query({ query });

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
        setSearchResult(prevData => {
          const existingIds = new Set(prevData.map(item => item.statdispid));

          const newData = result.data.tablelist.filter(
            (item: any) => !existingIds.has(item.statdispid)
          );

          return [...prevData, ...newData];
        });
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