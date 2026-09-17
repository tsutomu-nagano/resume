// src/app/StatCard.tsx
"use client";

import { DropdownContainer as Tag } from "./Dropdown.container";
import { print } from "graphql";
import { GrGraphQl } from "react-icons/gr";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import { GitBranch } from "lucide-react";
import { useState } from "react";
import { Drawer } from "./Drawer";
import { SearchHistoryPanel } from "./SearchHistoryPanel";
import { SearchOperatorGroup } from "./SearchOperatorGroup";
import { isSearchOperatorKind } from "@/lib/searchOperators";

interface SearchItemsProps {
  names: string[];
}

export default function SearchItems({ names }: SearchItemsProps) {
<<<<<<< HEAD
  const { items, searchQuery } = useSearchItem();
=======
  const { items, searchQuery, dimensionOperator, toggleDimensionOperator } =
    useSearchItem();
>>>>>>> 947c98d4cac8cd92c6c5e0888475771f250d2957
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleClick = () => {
    const modal = document.getElementById("view_graphQL");
    if (modal) {
      (modal as HTMLDialogElement).showModal();
    } else {
      console.error("Modal element not found");
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 rounded-md border border-base-300 bg-base-100 p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:p-4">
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          title="検索履歴を開く"
          aria-label="検索履歴を開く"
          onClick={() => setIsHistoryOpen(true)}
        >
          <GitBranch size={18} />
        </button>
        <span className="font-medium">検索条件</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap gap-2 items-center">
        {Array.from(items.entries()).map(([kind, names]) => {
          if (isSearchOperatorKind(kind)) {
            return null;
          }

          const itemNames = Array.from(names);
          const tags = itemNames.map((name) => (
            <Tag key={name} name={name} kind={kind} />
          ));

          return kind === "dimension" && itemNames.length > 1 ? (
            <SearchOperatorGroup
              key={kind}
              ariaLabel={
                dimensionOperator === "or"
                  ? "いずれかに一致する分類事項"
                  : "すべてに一致する分類事項"
              }
              operator={dimensionOperator}
              onToggleOperator={toggleDimensionOperator}
            >
              {tags}
            </SearchOperatorGroup>
          ) : (
            tags
          );
        })}
      </div>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn btn-outline w-full items-center sm:ml-auto sm:w-auto"
        onClick={handleClick}
      >
        <GrGraphQl />
        graphQLを表示
      </button>
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
      <Drawer
        id="search-history"
        title="検索履歴"
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen((current) => !current)}
        side="left"
        widthClassName="w-[min(40rem,96vw)]"
      >
        <SearchHistoryPanel />
      </Drawer>
    </div>
  );
}
