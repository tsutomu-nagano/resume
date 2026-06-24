"use client";

import { useSearchItem } from "../contexts/SearchItemsProvider";
import SurveyList from "./SurveyList";
import TableList from "./TableList";

export default function SearchResultList() {
  const { getItemsArray, view } = useSearchItem();
  const resultKey = `${view}:${getItemsArray()
    .map(({ kind, itemName }) => `${kind}=${itemName}`)
    .sort()
    .join("&")}`;

  return view === "surveys" ? (
    <SurveyList key={resultKey} />
  ) : (
    <TableList key={resultKey} />
  );
}
