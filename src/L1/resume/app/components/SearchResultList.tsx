"use client";

import { useSearchItem } from "../contexts/SearchItemsProvider";
import SurveyList from "./SurveyList";
import TableList from "./TableList";

export default function SearchResultList() {
  const { view } = useSearchItem();

  return view === "surveys" ? <SurveyList /> : <TableList />;
}
