import { Children, isValidElement, type ReactNode } from "react";

interface OrItemGroupProps {
  children: ReactNode;
  ariaLabel?: string;
}

export function OrItemGroup({
  children,
  ariaLabel = "いずれかに一致する項目",
}: OrItemGroupProps) {
  const items = Children.toArray(children);

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
              <span className="sr-only">または</span>
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold leading-none text-primary-content shadow-sm"
                aria-hidden="true"
              >
                ＋
              </span>
            </>
          ) : null}
          {item}
        </div>
      ))}
    </div>
  );
}
