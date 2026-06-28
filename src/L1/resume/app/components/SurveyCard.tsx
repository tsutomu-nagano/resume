"use client";

import {
  Building2,
  Landmark,
  Store,
  UsersRound,
} from "lucide-react";
import { BiHash, BiAward } from "react-icons/bi";
import { RiLoopLeftFill } from "react-icons/ri";
import {
  TbCalendarRepeat,
  TbHome,
  TbTable,
  TbTargetArrow,
  TbUser,
} from "react-icons/tb";
import { SurveyUnitIcon } from "../../lib/surveyUnitIcons";
import { Badge } from "./Badge"

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
  onSelect: () => void;
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
  onSelect,
}: SurveyCardProps) {

    console.log(attributes)

    const description = attributes.find(
    (attribute) => attribute.attribute.code === "description"
  )?.value;

  const surveyUnits = attributes
    .filter((attribute) => attribute.attribute.code === "survey_units")
    .map((attribute) => attribute.value);


  const surveyCycles = attributes
    .filter((attribute) => attribute.attribute.code === "survey_cycle")
    .map((attribute) => attribute.value);

  const statKind = attributes.find(
    (attribute) => attribute.attribute.code === "stat_kind"
  )?.value;

  console.log(statKind)

  return (
    <article className="card bg-base-100 w-full shadow-xl">
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
              <RiLoopLeftFill  className="size-4 shrink-0" />
              調査周期: {surveyCycles.join("、")}
            </span>
          )}
        </div>
        <h2 className="card-title">{statname}</h2>

        {description && (
          <p className="text-sm leading-6 text-base-content/80">
            {truncate(description)}
          </p>
        )}

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {statKind && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2">
                統計の種類:
              </span>
                <Badge 
                  key={statKind}
                  name={statKind}
                  icon = {<><BiAward /></>}
                  onClick={onSelect}
                />
            </div>
          )}
          {surveyUnits.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2">
                調査対象:
              </span>
              {surveyUnits.map((surveyUnit) => (
                <Badge 
                  key={surveyUnit}
                  name={surveyUnit}
                  icon = {<SurveyUnitIcon value={surveyUnit}/>}
                  onClick={onSelect}
                />
              ))}
            </div>
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
