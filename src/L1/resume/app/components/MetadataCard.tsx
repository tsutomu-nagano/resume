"use client";

import {
  descriptionByKind,
  kind_en2ja,
  renderIconByKind,
} from "../common/convertor";

interface MetadataCardProps {
  kind: string;
  name: string;
  isSelected: boolean;
  onToggle: () => void;
  onDeselect: () => void;
}

export function MetadataCard({
  kind,
  name,
  isSelected,
  onToggle,
  onDeselect,
}: MetadataCardProps) {
  return (
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
        {isSelected && (
          <div
            className="card-actions justify-end"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="btn btn-outline btn-primary btn-sm"
              onClick={onDeselect}
            >
              選択解除
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
