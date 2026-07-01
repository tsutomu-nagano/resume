
import type { ReactNode } from "react";


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
      className={`badge badge-outline m-1 cursor-pointer gap-1.5 px-3 py-4 hover:bg-primary ${
        isSelected ? "btn-primary" : "btn-outline"
      }`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {icon}
      <span>{name}</span>
    </button>
  );
}