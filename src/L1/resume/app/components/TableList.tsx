"use client"; // このファイルはクライアントサイドでのみ実行される

import { useState, useRef, useCallback, useEffect } from 'react';
import { gql, useQuery } from "@apollo/client";
import { createApolloClient } from "@/lib/apolloClient";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import TableCard from "./TableCard";
import { InfiniteScrollContainer } from './InfiniteScrollContainer'



export default function TableList() {

    const {loading, error, fetchMore, searchResult, isLast } = useSearchItem();

    useEffect(() => {
        fetchMore();
    }, []);

    if (loading) return <span className="loading loading-spinner text-primary"></span>
    if (error) return <p>Error: {error.message}</p>;
    

    return (
        <InfiniteScrollContainer fetchMore={fetchMore} isLast={isLast} >
        <div className="flex flex-col gap-y-10">
                {searchResult.map(
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
        </InfiniteScrollContainer>
    );
};

