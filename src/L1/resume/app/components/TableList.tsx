// src/app/StatCard.tsx
"use client";

import { gql } from "@apollo/client";
import { createApolloClient } from "@/lib/apolloClient";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import TableCard from "./TableCard";
import React, { useEffect, useState } from "react";

export default function TableList() {

  const client = createApolloClient();

  const { itemSet } = useSearchItem();

  // データを管理する状態
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {

        let measuresCondition = "";
        let themasCondition = "";

        if (itemSet.size !== 0) {
          const measuresArray = Array.from(itemSet)
            .filter(item => item[1] === "measure")
            .map(item => `"${item[0]}"`);
  
          if (measuresArray.length > 0) {
            measuresCondition = `table_measures: { name: { _in: [${measuresArray.join(",")}] } } `;
          }

          const themasArray = Array.from(itemSet)
            .filter(item => item[1] === "thema")
            .map(item => `"${item[0]}"`);
  
          if (themasArray.length > 0) {
            themasCondition = `table_tags: { tag_name: { _in: [${themasArray.join(",")}] } } `;
          }

        }
  


        const query = gql`
          query GetTableList {
            tablelist(where:{${measuresCondition} ${themasCondition}}, limit: 10) {
              statdispid
              cycle
              statcode
              survey_date
              title
              table_tags {
                tag_name
              }
              table_measures {
                name
              }
            }
          }
        `;
  
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

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
        }) => (
          <TableCard
            key={tbl.statdispid}
            title={tbl.title}
            cycle={tbl.cycle}
            statcode={tbl.statcode}
            survey_date={tbl.survey_date}
            tags={tbl.table_tags}
            measures={tbl.table_measures}
          />
        )
      )}
    </div>
  );
}
