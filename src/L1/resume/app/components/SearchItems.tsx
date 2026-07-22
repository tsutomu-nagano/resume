// src/app/StatCard.tsx
"use client";

import { DropdownContainer as Tag } from './Dropdown.container';
import { print } from 'graphql';
import { GrGraphQl } from "react-icons/gr";
import { useSearchItem } from '../contexts/SearchItemsProvider';

interface SearchItemsProps {
  names: string[];
}

export default function SearchItems({ names }: SearchItemsProps) {

  const { items, searchQuery } = useSearchItem();

  const handleClick = () => {
    const modal = document.getElementById('view_graphQL');
    if (modal) {
      (modal as HTMLDialogElement).showModal();
    } else {
      console.error('Modal element not found');
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 rounded-md border border-base-300 bg-base-100 p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:p-4">
      <span className="shrink-0 font-medium">検索条件</span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
      {Array.from(items.entries()).map(([kind, names])  => (
        Array.from(names).map(name => (
          <Tag key={name} name={name} kind={kind} />
        ))
      ))}
      </div>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button className="btn btn-outline w-full items-center sm:ml-auto sm:w-auto" onClick={handleClick}><GrGraphQl />graphQLを表示</button>
      <dialog id="view_graphQL" className="modal">
        <div className="modal-box max-w-[calc(100vw-2rem)] overflow-x-auto whitespace-pre-wrap">
        {print(searchQuery.query)}
          {searchQuery.variables && (
            <>
              {"\n\nVariables:\n"}
              {JSON.stringify(searchQuery.variables, null, 2)}
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
}
