export type SearchOperator = "or" | "and";

export const DIMENSION_OPERATOR_KIND = "dimension_operator";

export function isSearchOperatorKind(kind: string) {
  return kind === DIMENSION_OPERATOR_KIND;
}

export function getDimensionOperator(
  items: Map<string, Set<string>>,
): SearchOperator {
  return items.get(DIMENSION_OPERATOR_KIND)?.has("and") ? "and" : "or";
}
