import {
  Children,
  isValidElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<number | null>(null);
  const items = Children.toArray(children);
  const isOr = operator === "or";
  const tooltip = isOr
    ? "OR条件：いずれかを含む。クリックしてAND条件に変更"
    : "AND条件：すべてを含む。クリックしてOR条件に変更";
  const handleToggleOperator = () => {
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current);
    }

    setIsAnimating(true);
    onToggleOperator();
    animationTimeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      animationTimeoutRef.current = null;
    }, 500);
  };

  useEffect(
    () => () => {
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    },
    [],
  );

  return (
    <div
      className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-2xl border-2 border-[oklch(var(--p))] bg-primary/5 p-2"
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
                className={`tooltip flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-[oklch(var(--p))] text-base font-bold leading-none text-[oklch(var(--p))] shadow-sm transition-colors duration-500 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isAnimating ? "!border-black !bg-black !text-white" : ""
                }`}
                data-tip={tooltip}
                title={tooltip}
                aria-label={tooltip}
                onClick={handleToggleOperator}
              >
                <span
                  className={`inline-block transition-transform duration-500 ease-out motion-reduce:transition-none ${
                    isOr ? "rotate-0" : "rotate-90"
                  }`}
                  aria-hidden="true"
                >
                  {isOr ? "＋" : "×"}
                </span>
              </button>
            </>
          ) : null}
          {item}
        </div>
      ))}
    </div>
  );
}
