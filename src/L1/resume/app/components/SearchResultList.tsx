"use client";

import { useSearchItem } from "../contexts/SearchItemsProvider";
import MetadataList from "./MetadataList";
import SurveyList from "./SurveyList";
import TableList from "./TableList";

export default function SearchResultList() {
  const { getItemsArray, view } = useSearchItem();
  const resultKey = `${view}:${getItemsArray()
    .map(({ kind, itemName }) => `${kind}=${itemName}`)
    .sort()
    .join("&")}`;

  if (view === "surveys") {
    return <SurveyList key={resultKey} />;
  }

  if (view === "metadata") {
    return <MetadataList key={resultKey} />;
  }

  return <TableList key={resultKey} />;
}
