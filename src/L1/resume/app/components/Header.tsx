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
                <SearchItemSelector labelja="統計調査" labelen="" resource_name="statlist" resource_field="statname" kind="stat" />
                <SearchItemSelector labelja="集計事項" labelen="" resource_name="table_measure" resource_field="name" kind="measure" />
                <SearchItemSelector labelja="分類事項" labelen="" resource_name="table_dimension" resource_field="class_name" kind="dimension" />
            </div>
            <SearchCountResult />
            <SearchItems names={[""]} />
        </header>
    )
};