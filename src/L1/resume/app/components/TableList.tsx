// src/app/StatCard.tsx
"use client";

import { gql } from "@apollo/client";
import { createApolloClient } from "@/lib/apolloClient";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import TableCard from "./TableCard";
import React, { useEffect, useState } from "react";

export default function TableList() {

  const client = createApolloClient();

  const { items, searchQuery } = useSearchItem();

  // データを管理する状態
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {

  
        const query = gql`${searchQuery}`;
  
        const result = await client.query({
          query,
        });

        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [client]);

  if (loading) return <span className="loading loading-spinner text-primary"></span>
  if (error) return <p>Error: {error.message}</p>;


  console.log(data.tablelist);

  return (
      <div className="flex flex-col gap-y-10">
        {data?.tablelist.map(
          (tbl: {
            statdispid: string;
            cycle: string;
            statcode: string;
            survey_date: string;
            title: string;
            table_tags: { tag_name: string }[];
            table_measures: { name: string }[];
            table_dimensions: { class_name: string }[];
          }) => (
            <TableCard
              key={tbl.statdispid}
              statdispid={tbl.statdispid}
              title={tbl.title}
              cycle={tbl.cycle}
              statcode={tbl.statcode}
              survey_date={tbl.survey_date}
              tags={tbl.table_tags}
              measures={tbl.table_measures}
              dimensions={tbl.table_dimensions}
            />
          )
        )}
    </div>
  );
}
