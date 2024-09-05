"use client";

import { useEffect } from 'react'
import { useSearchItem } from '../contexts/SearchItemsProvider';
import { renderIconByKind } from "../common/convertor"

export default function SearchCountResult() {

    const {loading, error, fetchCount, countResult } = useSearchItem();

    useEffect(() => {
        fetchCount();
    }, []);

    if (loading) return <span className="loading loading-spinner text-primary"></span>
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="flex flex-row gap-2 items-center">

            <div className="flex flex-row gap-2 items-center p-2">
                {renderIconByKind("stat")}{"統計調査"}
                <div className="badge badge-primary">
                    {countResult?.stat ?? 'N/A'}  {/* countResult.stat が undefined なら 'N/A' を表示 */}
                </div>
            </div>

            <div className="flex flex-row gap-2 items-center p-2">
                {renderIconByKind("db")}{"統計データ"}
                <div className="badge badge-lg badge-primary">
                    {countResult?.db ?? 'N/A'}  {/* countResult.db が undefined なら 'N/A' を表示 */}
                </div>
            </div>

        </div>
    )
};