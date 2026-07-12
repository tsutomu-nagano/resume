"use client";

import { Landmark, MousePointerClick } from "lucide-react";
import { BiHash, BiAward } from "react-icons/bi";
import { RiLoopLeftFill } from "react-icons/ri";
import { TbTable } from "react-icons/tb";
import { SurveyUnitIcon } from "../../lib/surveyUnitIcons";
import { SearchConditionBadge } from "./SearchConditionBadge";

type SurveyAttribute = {
  value: string;
  attribute: {
    code: string;
    label: string;
  };
};

interface SurveyCardProps {
  statcode: string;
  statname: string;
  govname: string;
  tableCount: number;
  attributes?: SurveyAttribute[];
  isSelected: boolean;
  onToggle: () => void;
  onDeselect: () => void;
}

function truncate(value: string, length = 240) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

export function SurveyCard({
  statcode,
  statname,
  govname,
  tableCount,
  attributes = [],
  isSelected,
  onToggle,
  onDeselect,
}: SurveyCardProps) {
  const description = attributes.find(
    (attribute) => attribute.attribute.code === "description",
  )?.value;

  const surveyUnits = attributes
    .filter((attribute) => attribute.attribute.code === "survey_units")
    .map((attribute) => attribute.value);

  const surveyCycles = attributes
    .filter((attribute) => attribute.attribute.code === "survey_cycle")
    .map((attribute) => attribute.value);

  const statKind = attributes.find(
    (attribute) => attribute.attribute.code === "stat_kind",
  )?.value;

  return (
    <article
      className={`group card w-full cursor-pointer border-2 text-left shadow-xl transition hover:-translate-y-0.5 hover:bg-primary/5 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 ${
        isSelected
          ? "border-[#4A00FF] bg-[#4A00FF]/10"
          : "border-base-300 bg-base-100 hover:border-[#4A00FF]/50"
      }`}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="card-body gap-4">
        <div className="flex flex-row flex-wrap items-center gap-5 text-sm">
          <div className="flex flex-row items-center gap-2">
            <BiHash />
            <span>{statcode}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Landmark className="size-4 shrink-0" />
            <span>{govname}</span>
          </div>
          {surveyCycles.length > 0 && (
            <span className="flex items-center gap-2">
              <RiLoopLeftFill className="size-4 shrink-0" />
              調査周期: {surveyCycles.join("、")}
            </span>
          )}
          {isSelected && <span className="badge badge-primary">選択中</span>}
          <span className="ml-auto inline-flex items-center gap-1 rounded border border-primary/40 bg-base-100/90 px-2 py-1 text-xs text-primary opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">
            <MousePointerClick className="size-3" />
            {isSelected ? "クリックで選択解除" : "クリックで検索条件に追加"}
          </span>
        </div>
        <h2 className="card-title">{statname}</h2>

        {description && (
          <p className="text-sm leading-6 text-base-content/80">
            {truncate(description)}
          </p>
        )}

        <div
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {statKind && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2">統計の種類:</span>
              <SearchConditionBadge
                key={statKind}
                kind="stat_kind"
                name={statKind}
                icon={<BiAward />}
              />
            </div>
          )}
          {surveyUnits.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2">調査対象:</span>
              {surveyUnits.map((surveyUnit) => (
                <SearchConditionBadge
                  key={surveyUnit}
                  kind="survey_unit"
                  name={surveyUnit}
                  icon={<SurveyUnitIcon value={surveyUnit} />}
                />
              ))}
            </div>
          )}
        </div>

        <div
          className="card-actions mt-2 items-center justify-between"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <span className="flex items-center gap-2 text-sm">
            <TbTable />
            統計表 {tableCount} 件
          </span>
          <div className="flex flex-wrap justify-end gap-2">
            {isSelected && (
              <button
                type="button"
                className="btn btn-outline btn-primary"
                onClick={onDeselect}
              >
                選択解除
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
