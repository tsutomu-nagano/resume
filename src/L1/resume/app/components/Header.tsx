"use client";

import SearchItems from "./SearchItems";
import SearchItemSelector from "./SearchItemSelector";
import SurveyUnitSelector from "./SurveyUnitSelector";
import StatKindSelector from "./StatKindSelector";

import { RegionSelectorContainer as RegionSelector } from "./RegionSelector.container";
import { TimeSelectorContainer as TimeSelector } from "./TimeSelector.container";
import { SearchCountResultContainer as SearchCountResult } from "./SearchCountResult.container";
import { GitHubLink } from "./GithubButton";
import { NaturalLanguageSearch } from "./NaturalLanguageSearch";
import { Info } from "lucide-react";

export function Header() {
  const handleAboutClick = () => {
    const modal = document.getElementById("about_service");
    if (modal) {
      (modal as HTMLDialogElement).showModal();
    }
  };

  return (
    <header className="flex min-w-0 flex-col gap-3">
      <div className="navbar min-h-0 flex-col items-stretch gap-3 rounded-md border border-base-300 bg-base-100 p-3 shadow-sm lg:flex-row lg:items-center">
        <a className="btn btn-ghost h-14 w-fit px-2" aria-label="ReSUME L1">
          <img
            src="/resume-logo.png"
            alt="ReSUME L1"
            className="h-12 w-auto object-contain"
          />
          <span className="badge badge-primary badge-sm translate-y-1">L1</span>
        </a>
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-wrap gap-1">
            <SearchItemSelector
              labelja="統計調査"
              labelen=""
              ref_names={["TABLELISTs"]}
              resource_name="STATLIST"
              resource_field="STATNAME"
              kind="stat"
            />
            <SurveyUnitSelector
              labelja="調査対象"
              labelen=""
              ref_names={["STATLIST", "TABLELISTs"]}
              resource_name="STAT_ATTRIBUTE_VALUES"
              resource_field="VALUE"
              kind="survey_unit"
            />
            <StatKindSelector
              labelja="統計の種類"
              labelen=""
              ref_names={["STATLIST", "TABLELISTs"]}
              resource_name="STAT_ATTRIBUTE_VALUES"
              resource_field="VALUE"
              kind="stat_kind"
            />
            <SearchItemSelector
              labelja="集計事項"
              labelen=""
              ref_names={["TABLE_MEASUREs", "TABLELIST"]}
              resource_name="MEASURELIST"
              resource_field="NAME"
              kind="measure"
            />
            <RegionSelector />
            <SearchItemSelector
              labelja="分類事項"
              labelen=""
              ref_names={["TABLE_DIMENSIONs", "TABLELIST"]}
              resource_name="DIMENSIONLIST"
              resource_field="CLASS_NAME"
              kind="dimension"
            />
            <TimeSelector />
          </div>
          <button
            type="button"
            className="btn btn-outline w-full shrink-0 gap-2 lg:ml-auto lg:w-auto"
            onClick={handleAboutClick}
          >
            <Info className="size-4" />
            このサービスについて
          </button>
        </div>
      </div>
      <dialog id="about_service" className="modal">
        <div className="modal-box max-w-lg">
          <h2 className="text-lg font-bold">このサービスについて</h2>
          <p className="mt-4 text-sm leading-6 text-base-content/80">
            このサービスは、政府統計総合窓口(e-Stat)のAPI機能を使用していますが、サービスの内容は国によって保証されたものではありません。
          </p>
          <div className="mt-6">
            <div className="text-sm font-semibold">ソースコード</div>
            <div className="mt-2 inline-flex text-2xl">
              <GitHubLink />
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">閉じる</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <div className="px-1 sm:px-4">
        <SearchCountResult />
      </div>
      <NaturalLanguageSearch />
      <SearchItems names={[""]} />
    </header>
  );
}
