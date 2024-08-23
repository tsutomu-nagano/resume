// src/app/StatCard.tsx
"use client";

import Tag from './Tag';

import { useSearchItem } from '../contexts/SearchItemsProvider';

interface SearchItemsProps {
  names: string[];
}

export default function SearchItems({ names }: SearchItemsProps) {

  const { itemSet } = useSearchItem();

  return (
    <div className="bg-base-100 w-full p-4 shadow-xl flex flex-row gap-2 items-center">
      <span>検索条件</span>
      {Array.from(itemSet).map(item => (
        <Tag key={item[0]} name={item[0]} kind={item[1]} />
      ))}
    </div>
  );
}

