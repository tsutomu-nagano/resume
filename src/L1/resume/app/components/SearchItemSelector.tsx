// src/app/StatCard.tsx
"use client";

import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { createApolloClient } from '@/lib/apolloClient';

import { FaChevronDown } from "react-icons/fa6";
import Tag from './Tag';

import { useSearchItem } from '../contexts/SearchItemsProvider';

interface SearchItemsProps {
  names: string[];
}


interface SearchItemSelectorProps {
  labelja: string;
  labelen: string;

}

export default function SearchItemSelector({ labelja, labelen = "" }: SearchItemSelectorProps) {

  const { itemSet } = useSearchItem();

  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const client = createApolloClient();

  const handleSearch = async () => {
    try {
      const { data } = await client.query({
        query: gql`
          query GetMeasures {
            table_measure(distinct_on: name, where: { name: { _ilike: "%${searchTerm}%" }} ) {
              name
            }
          }
        `
      });


      setData(data)
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }

    };


  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };


  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="flex flex-row gap-2 btn btn-outline m-1">{labelja}から探す<FaChevronDown /></div>
      <div
        tabIndex={0}
        className="dropdown-content card card-compact bg-base-100 z-[1] w-[700px] p-2 shadow">
        <div className="card-body">

          {itemSet.size > 0 && (
            <>
              <div className="divider divider-start divider-primary">現在選択している{labelja}</div>
              <div className="flex flex-row flex-wrap">
                {Array.from(itemSet).map(item => (
                  <Tag key={item[0]} name={item[0]} kind={item[1]} />
                ))}
              </div>
            </>
          )}

          <div className="divider divider-start divider-primary">キーワードで   検索</div>

          <label className="input input-bordered flex items-center gap-2">
            <input
              type="text"
              className="grow"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70">
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd" />
            </svg>
          </label>
          <div className="flex flex-wrap">
            {data?.table_measure.map(
              (measure: {name: string;}) => (
                <Tag name={measure.name} kind="measure" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

