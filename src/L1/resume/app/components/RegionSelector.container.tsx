// src/app/StatCard.tsx
"use client";

import { RegionSelector } from "./RegionSelector";

import React, { useState, useMemo } from "react";
import { createApolloClient } from "@/lib/apolloClient";
import { GET_SEARCH_TAG_LIST } from "../../lib/queries";

import { useSearchItem } from "../contexts/SearchItemsProvider";
import { TagContainer as Tag } from "./Tag.container";

export function RegionSelectorContainer() {
  const kind = "region";
  const labelja = "地域";

  const { items, getItemsArray } = useSearchItem();

  const itemsArray = getItemsArray(kind);

  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const client = createApolloClient();

  const resource_name = "REGIONLIST";
  const resource_field = "NAME";
  const ref_names = ["TABLE_REGIONs", "TABLELIST"];

  const onScopeChange = (scope: { name: string; checked: boolean }) => {};

  const onSearch = async (word: string) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const searchQuery = GET_SEARCH_TAG_LIST(
        resource_name,
        resource_field,
        ref_names,
        word,
        items,
      );

      const { data } = await client.query(searchQuery);
      setData(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegionSelector onScopeChange={onScopeChange} onSearch={onSearch}>
      {loading ? (
        <div className="mt-2 flex items-center gap-2 text-sm text-base-content/60">
          <span className="loading loading-dots loading-xs" />
          検索中です
        </div>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-error">
          検索に失敗しました。もう一度お試しください。
        </p>
      ) : null}
      <div className="flex flex-wrap">
        {data?.items.map((item: { name: string }) => (
          <Tag key={item.name} name={item.name} kind={kind} simple={true} />
        ))}
      </div>
      {!loading && hasSearched && data?.items.length === 0 ? (
        <p className="mt-2 text-sm text-base-content/60">
          該当する候補はありません。
        </p>
      ) : null}
    </RegionSelector>
  );
}
