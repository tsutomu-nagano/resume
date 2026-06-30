import type { ReactNode } from "react";
import type { ChangeEvent } from "react";
import { useSearchItem } from "../contexts/SearchItemsProvider";

interface SearchConditionCheckboxProps {
  kind: string;
  name: string;
  icon?: ReactNode;
}

export function SearchConditionCheckbox({
  kind,
  name,
  icon
}: SearchConditionCheckboxProps) {
  const { findItem, addItem, removeItem } = useSearchItem();

  const isSelected = findItem(kind, name);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      addItem(kind, name);
    } else {
      removeItem(kind, name);
    }
  };

  return (
    <label className="label cursor-pointer justify-start gap-2">
      <input
        type="checkbox"
        name="scopePrefectures"
        className="checkbox"
        checked={isSelected}
        onChange={handleChange}
      />
      {icon}
      <span>{name}</span>
    </label>
  );
}