// src/app/StatCard.tsx
"use client";

import { gql } from '@apollo/client';
import { createApolloClient } from '@/lib/apolloClient';
import StatCard from './StatCard';
import React, { useEffect, useState } from "react";


export default function StatList() {

  const client = createApolloClient();
  
  // データを管理する状態
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {

        const query = gql`
          query GetStatList {
            statlist {
              statcode
              statname
              govlist {
                govname
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

  if (loading) return <span className="loading loading-dots loading-lg"></span>;
  if (error) return <p>Error: {error.message}</p>;



  return (
    <div className="flex flex-col gap-y-10">
    {data?.statlist.map((stat: { statcode: string; statname: string; govlist: {govname: string} }) => (
        <StatCard key={stat.statcode} statcode={stat.statcode} statname={stat.statname} govname={stat.govlist.govname} />
      ))}
    </div>
 );
}
