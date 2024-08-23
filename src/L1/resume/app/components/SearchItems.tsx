// src/app/StatCard.tsx
"use client";

import Tag from './Tag';
import { GrGraphQl } from "react-icons/gr";
import { useSearchItem } from '../contexts/SearchItemsProvider';

interface SearchItemsProps {
  names: string[];
}

export default function SearchItems({ names }: SearchItemsProps) {

  const { itemSet, searchQuery } = useSearchItem();

  const handleClick = () => {
    const modal = document.getElementById('view_graphQL');
    if (modal) {
      (modal as HTMLDialogElement).showModal();
    } else {
      console.error('Modal element not found');
    }
  };

  return (
    <div className="bg-base-100 w-full p-4 shadow-xl flex flex-row gap-2 items-center">
      <span>検索条件</span>
      {Array.from(itemSet).map(item => (
        <Tag key={item[0]} name={item[0]} kind={item[1]} />
      ))}
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button className="btn btn-outline items-center ml-auto" onClick={handleClick}><GrGraphQl />graphQLを表示</button>
      <dialog id="view_graphQL" className="modal">
        <div className="modal-box">
        {searchQuery}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
}

