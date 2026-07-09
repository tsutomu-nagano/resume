import type { ReactNode } from "react";
import { Badge } from "./Badge";
import { useSearchItem } from "../contexts/SearchItemsProvider";

interface SearchConditionBadgeProps {
  kind: string;
  name: string;
  icon?: ReactNode;
}

export function SearchConditionBadge({
  kind,
  name,
  icon,
}: SearchConditionBadgeProps) {
  const { findItem, addItem, removeItem } = useSearchItem();

  const isSelected = findItem(kind, name);

  const handleClick = () => {
    if (isSelected) {
      removeItem(kind, name);
    } else {
      addItem(kind, name);
    }
  };

  return (
    <Badge
      name={name}
      icon={icon}
      isSelected={isSelected}
      onClick={handleClick}
    />
  );
}