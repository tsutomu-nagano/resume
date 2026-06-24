"use client";

import { BiHash } from "react-icons/bi";
import { TbCalendarRepeat, TbTable, TbTargetArrow } from "react-icons/tb";

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
  tableCount: number;
  attributes?: SurveyAttribute[];
  onSelect: () => void;
}

function truncate(value: string, length = 240) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

export function SurveyCard({
  statcode,
  statname,
  tableCount,
  attributes = [],
  onSelect,
}: SurveyCardProps) {
  const description = attributes.find(
    (attribute) => attribute.attribute.code === "description"
  )?.value;
  const surveyUnits = attributes
    .filter((attribute) => attribute.attribute.code === "survey_units")
    .map((attribute) => attribute.value);
  const surveyCycle = attributes.find(
    (attribute) => attribute.attribute.code === "survey_cycle"
  )?.value;

  return (
    <article className="card bg-base-100 w-full shadow-xl">
      <div className="card-body gap-4">
        <div className="flex flex-row items-center gap-2 text-sm">
          <BiHash />
          <span>{statcode}</span>
        </div>
        <h2 className="card-title">{statname}</h2>

        {description && (
          <p className="text-sm leading-6 text-base-content/80">
            {truncate(description)}
          </p>
        )}

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {surveyUnits.length > 0 && (
            <span className="flex items-center gap-2">
              <TbTargetArrow />
              調査対象: {surveyUnits.join(" / ")}
            </span>
          )}
          {surveyCycle && (
            <span className="flex items-center gap-2">
              <TbCalendarRepeat />
              調査周期: {surveyCycle}
            </span>
          )}
        </div>

        <div className="card-actions items-center justify-between mt-2">
          <span className="flex items-center gap-2 text-sm">
            <TbTable />
            統計表 {tableCount} 件
          </span>
          <button type="button" className="btn btn-primary" onClick={onSelect}>
            統計表を見る
          </button>
        </div>
      </div>
    </article>
  );
}
