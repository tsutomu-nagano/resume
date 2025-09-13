"use client";

import SearchItems from './SearchItems';
import SearchItemSelector from './SearchItemSelector';
import { RegionSelectorContainer as RegionSelector } from './RegionSelector.container';
import { TimeSelectorContainer as TimeSelector } from './TimeSelector.container';
import { SearchCountResultContainer as SearchCountResult } from "./SearchCountResult.container"
import { GitHubLink } from './GithubButton';

export function Header() {

    return (
        <header className="flex flex-col gap-2">
            <div className="navbar bg-base-100">
                <a className="btn btn-ghost text-xl">ReSUME L1</a>
                <SearchItemSelector labelja="統計調査" labelen="" ref_names={["TABLELISTs"]} resource_name="STATLIST" resource_field="STATNAME" kind="stat" />
                <SearchItemSelector labelja="集計事項" labelen="" ref_names={["TABLE_MEASUREs", "TABLELIST"]} resource_name="MEASURELIST" resource_field="NAME" kind="measure" />
                <RegionSelector />
                {/* <SearchItemSelector labelja="地域事項" labelen="" ref_names = {["TABLE_REGIONs","TABLELIST"]} resource_name="REGIONLIST" resource_field="CLASS_NAME" kind="region" /> */}
                <SearchItemSelector labelja="分類事項" labelen="" ref_names={["TABLE_DIMENSIONs", "TABLELIST"]} resource_name="DIMENSIONLIST" resource_field="CLASS_NAME" kind="dimension" />
                <TimeSelector />
                <span className="ml-4 text-xs">このサービスは、政府統計総合窓口(e-Stat)のAPI機能を使用していますが、サービスの内容は国によって保証されたものではありません。</span>
                <div className="ml-auto text-3xl mr-4 tooltip tooltip-left" data-tip="githubのリポジトリを表示します">
                    <GitHubLink />
                </div>
            </div>
            <div className="ml-4"><SearchCountResult /></div>
            <SearchItems names={[""]} />
        </header>
    )
};