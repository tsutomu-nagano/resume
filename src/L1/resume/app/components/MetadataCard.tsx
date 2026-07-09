"use client";

import {
  descriptionByKind,
  kind_en2ja,
  renderIconByKind,
} from "../common/convertor";

interface MetadataCardProps {
  kind: string;
  name: string;
  onSelect: (kind: string, name: string) => void;
}

export function MetadataCard({ kind, name, onSelect }: MetadataCardProps) {
  return (
    <button
      type="button"
      className="card w-full bg-base-100 text-left shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
      onClick={() => onSelect(kind, name)}
    >
      <div className="card-body gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
          {renderIconByKind(kind)}
          <span className="badge badge-outline">{kind_en2ja(kind)}</span>
          <span>{descriptionByKind(kind)}</span>
        </div>
        <h2 className="card-title text-base leading-relaxed">{name}</h2>
      </div>
    </button>
  );
}
