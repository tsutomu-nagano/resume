"use client";

import { useEffect } from 'react'
import { useSearchItem } from '../contexts/SearchItemsProvider';
import { renderIconByKind } from "../common/convertor"
import { SearchCountResult } from "./SearchCountResult";

export function SearchCountResultContainer() {

    const {loading, error, countResult } = useSearchItem();

    if (loading) return <span className="loading loading-spinner text-primary"></span>
    if (error) return <p>Error: {error.message}</p>;

    return <SearchCountResult
                stat={Number(countResult?.stat ?? 0)}
                db={Number(countResult?.db ?? 0)}
        />
};