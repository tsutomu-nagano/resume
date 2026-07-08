"use client";

import { Landmark } from "lucide-react";
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
  onSelect: () => void;
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
  onSelect,
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
      className={`card w-full cursor-pointer border-2 bg-base-100 text-left shadow-xl transition hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary ${
        isSelected ? "border-primary" : "border-transparent"
      }`}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="card-body gap-4">
        <div className="flex flex-row items-center gap-5 text-sm">
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
            <button type="button" className="btn btn-primary" onClick={onSelect}>
              統計表を見る
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
