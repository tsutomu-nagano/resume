"use client"; // このファイルはクライアントサイドでのみ実行される

import { useState, useRef, useCallback, useEffect } from 'react';
import { gql, useQuery } from "@apollo/client";
import { createApolloClient } from "@/lib/apolloClient";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import TableCard from "./TableCard";


export default function TableList() {

    const limit = 5;
    const client = createApolloClient();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
  
    const [hasMore, setHasMore] = useState<boolean>(true);
    const {searchQuery_Inf, offset, setOffset } = useSearchItem();
    const bottomBoundaryRef = useRef<HTMLDivElement | null>(null);
    const [needFetchMore , setNeedFetchMore ] = useState<boolean>(true)


    const fetchMore = async () => {
        try {


            if (data.length != 0){
                const newOffset = offset + limit;
                setOffset(newOffset);
            }

            console.log(offset)
            console.log(limit)

            const query = gql`${searchQuery_Inf}`;
        
            const result = await client.query({
                query,
                variables: { limit_number: limit, offset_number: offset },
        });


        setData(prevData => [...prevData, ...result.data.tablelist]);
        } catch (err) {
        setError(err as Error);
        } finally {
        setLoading(false);
        }
    };

    // Scroll observer callback
    const scrollObserver = useCallback(
        (node: any) => {
          new IntersectionObserver((entries) => {
            entries.forEach((en) => {
              // ビューポートに入ったら true になります
              if (en.isIntersecting) {
             // needFetchMore を true 更新
             // 時間がかかる重い処理はここに置かないように注意
                 setNeedFetchMore(true);
              }
            });
          }).observe(node);
        },[fetchMore]
      );

    useEffect(() => {
        if (bottomBoundaryRef.current) {
            scrollObserver(bottomBoundaryRef.current);
        }
    }, [scrollObserver]);

    useEffect(() => {
        // needFetchMore が true になったら fetchMore を発火する
        if (needFetchMore) {
          fetchMore();
          setNeedFetchMore(false);
        }
    }, [needFetchMore, fetchMore, setNeedFetchMore]);

    if (loading) return <span className="loading loading-spinner text-primary"></span>
    if (error) return <p>Error: {error.message}</p>;
    

    return (
        <div className="flex flex-col gap-y-10">
            {data.map(
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
            <div ref={bottomBoundaryRef} />
        </div>
    );
};

