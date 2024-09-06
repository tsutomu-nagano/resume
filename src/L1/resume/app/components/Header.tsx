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
                <SearchItemSelector labelja="統計調査" labelen="" ref_names = {["TABLELISTs"]} resource_name="STATLIST" resource_field="STATNAME" kind="stat" />
                <SearchItemSelector labelja="集計事項" labelen="" ref_names = {["TABLE_MEASUREs","TABLELIST"]} resource_name="MEASURELIST" resource_field="NAME" kind="measure" />
                <SearchItemSelector labelja="分類事項" labelen="" ref_names = {["TABLE_DIMENSIONs", "TABLELIST"]} resource_name="DIMENSIONLIST" resource_field="CLASS_NAME" kind="dimension" />
            </div>
            <div className="ml-4"><SearchCountResult /></div>
            <SearchItems names={[""]} />
        </header>
    )
};