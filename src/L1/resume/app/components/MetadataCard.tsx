"use client";

import { useId, useState } from "react";
import { FiInfo } from "react-icons/fi";
import {
  descriptionByKind,
  kind_en2ja,
  renderIconByKind,
} from "../common/convertor";
import { DimensionItemInfo } from "./DimensionItemInfo";
import { Drawer } from "./Drawer";
import { MetadataCardCounts } from "./MetadataCardCounts";
import { MetadataSurveyList } from "./MetadataSurveyList";

interface MetadataCardProps {
  kind: string;
  name: string;
  matchReason?: {
    matchedByClass: boolean;
    matchedByItem: boolean;
    matchedItemNames: string[];
  } | null;
  isSelected: boolean;
  onToggle: () => void;
}

export function MetadataCard({
  kind,
  name,
  matchReason,
  isSelected,
  onToggle,
}: MetadataCardProps) {
  const drawerId = useId();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const title = (
    <div className="flex flex-row items-center gap-2">
      {renderIconByKind(kind)}
      {name}
    </div>
  );
  const toggleDrawer = () => setDrawerOpen((previousState) => !previousState);
  const showDimensionItems = kind === "dimension" || kind === "region";

  return (
    <>
      <article
        className={`group card w-full cursor-pointer border-2 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40 ${
          isSelected
            ? "border-[#4A00FF] bg-[#4A00FF]/10"
            : "border-base-300 bg-base-100 hover:border-[#4A00FF]/50"
        }`}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
      >
        <div className="card-body gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
            {renderIconByKind(kind)}
            <span className="badge badge-outline">{kind_en2ja(kind)}</span>
            <span>{descriptionByKind(kind)}</span>
            {isSelected && <span className="badge badge-primary">選択中</span>}
          </div>
          <h2 className="card-title text-base leading-relaxed">{name}</h2>
          {matchReason ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {matchReason.matchedByClass ? (
                <span className="badge badge-info badge-outline">
                  事項名に一致
                </span>
              ) : null}
              {matchReason.matchedByItem ? (
                <span className="badge badge-secondary badge-outline">
                  項目名に一致
                </span>
              ) : null}
              {matchReason.matchedItemNames.slice(0, 3).map((itemName) => (
                <span
                  key={itemName}
                  className="badge badge-ghost max-w-full truncate"
                  title={itemName}
                >
                  {itemName}
                </span>
              ))}
            </div>
          ) : null}
          <MetadataCardCounts kind={kind} name={name} />
          <div
            className="card-actions justify-end"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="btn btn-outline btn-primary btn-sm gap-2"
              onClick={toggleDrawer}
            >
              <FiInfo />
              詳細
            </button>
          </div>
        </div>
      </article>
      {showDimensionItems ? (
        <DimensionItemInfo
          id={drawerId}
          kind={kind}
          title={title}
          name={name}
          isOpen={isDrawerOpen}
          onToggle={toggleDrawer}
        />
      ) : (
        <Drawer
          id={drawerId}
          title={title}
          isOpen={isDrawerOpen}
          onToggle={toggleDrawer}
          sidebarContent={
            <>
              <span className="text-xl">Overview</span>
              <span className="text-base">hogehoge</span>
              <li>
                <a>Custom Sidebar Item 1</a>
              </li>
              <li>
                <a>Custom Sidebar Item 2</a>
              </li>
              <MetadataSurveyList
                kind={kind}
                name={name}
                isOpen={isDrawerOpen}
              />
            </>
          }
        />
      )}
    </>
  );
}
