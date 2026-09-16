import { Children, isValidElement, type ReactNode } from "react";
import type { SearchOperator } from "@/lib/searchOperators";

interface SearchOperatorGroupProps {
  children: ReactNode;
  ariaLabel?: string;
  operator: SearchOperator;
  onToggleOperator: () => void;
}

export function SearchOperatorGroup({
  children,
  ariaLabel = "いずれかに一致する項目",
  operator,
  onToggleOperator,
}: SearchOperatorGroupProps) {
  const items = Children.toArray(children);
  const isOr = operator === "or";
  const tooltip = isOr
    ? "OR条件：いずれかを含む。クリックしてAND条件に変更"
    : "AND条件：すべてを含む。クリックしてOR条件に変更";

  return (
    <div
      className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-2xl border-2 border-primary bg-primary/5 p-2"
      role="group"
      aria-label={ariaLabel}
    >
      {items.map((item, index) => (
        <div
          key={isValidElement(item) && item.key !== null ? item.key : index}
          className="flex items-center gap-1"
        >
          {index > 0 ? (
            <>
              <span className="sr-only">{isOr ? "または" : "かつ"}</span>
              <button
                type="button"
                className="tooltip flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold leading-none text-primary-content shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-tip={tooltip}
                title={tooltip}
                aria-label={tooltip}
                onClick={onToggleOperator}
              >
                {isOr ? "＋" : "×"}
              </button>
            </>
          ) : null}
          {item}
        </div>
      ))}
    </div>
  );
}
