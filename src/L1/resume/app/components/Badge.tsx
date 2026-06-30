
import type { ReactNode } from "react";
import { useSearchItem } from '../contexts/SearchItemsProvider';
import { useState, useEffect } from 'react'


interface BadgeProps {
  name: string;
  isSelected?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}

export function Badge({
  name,
  isSelected,
  icon,
  onClick,
}: BadgeProps) {
    return (
    <button
      type="button"
      className={`badge group m-1 cursor-pointer gap-1.5 px-3 py-4 ${
        isSelected ? "badge-primary" : "badge-outline hover:bg-neutral hover:text-white"
      }`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {icon}
      <span>{name}</span>
    </button>
  );
}