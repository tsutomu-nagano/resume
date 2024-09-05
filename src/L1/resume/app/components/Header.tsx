"use client";

import { useEffect } from 'react'
import SearchItems from './SearchItems';
import SearchItemSelector from './SearchItemSelector';
import SearchCountResult from "./SearchCountResult"

export default function Header() {

    return (
        <header className="flex flex-col gap-2">
            <div className="navbar bg-base-100">
                <a className="btn btn-ghost text-xl">ReSUME L1</a>
                <SearchItemSelector labelja="統計調査" labelen="" resource_name="STATLIST" resource_field="STATNAME" kind="stat" />
                <SearchItemSelector labelja="集計事項" labelen="" resource_name="TABLE_MEASURE" resource_field="NAME" kind="measure" />
                <SearchItemSelector labelja="分類事項" labelen="" resource_name="TABLE_DIMENSION" resource_field="CLASS_NAME" kind="dimension" />
            </div>
            <SearchCountResult />
            <SearchItems names={[""]} />
        </header>
    )
};