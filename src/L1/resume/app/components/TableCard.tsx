// src/app/StatCard.tsx
"use client";

import { BiHash } from "react-icons/bi";
import { RiLoopLeftFill } from "react-icons/ri";
import { TbDatabaseShare } from "react-icons/tb";
import { DropdownContainer as Tag } from './Dropdown.container';
import { renderIconByKind } from "../common/convertor";


interface TableCardProps {
  statdispid: string;
  statcode: string;
  cycle: string;
  survey_date: string;
  title: string;
  year_s: string;
  year_e: string;
  tags?: { tag_name: string }[];
  measures?: { name: string }[];
  dimensions?: { class_name: string }[];
  regions?: { regiontype: string }[];
}

export function TableCard({ statdispid, statcode, cycle, survey_date, title, year_s, year_e, tags, measures, dimensions, regions }: TableCardProps) {


  const regionLabel = new Map<string, string>([
    ["ken", "都道府県"],
    ["city", "市区町村"],
  ]);

  const year_view: string = year_s === year_e
    ? (year_s === "0" ? "-" : year_s)
    : `${year_s} - ${year_e}`


  const handleClick = () => {
    window.open(`https://www.e-stat.go.jp/dbview?sid=${statdispid}`, '_blank');
  };

  return (
    <div className="card bg-base-100 w-200 shadow-xl">
      <div className="card-body">
        <div className="flex flex-row gap-5 mb-5">
          <div className="flex flex-row items-center gap-2">
            <BiHash />
            <span>{statcode}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <BiHash />
            <span>{statdispid}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <RiLoopLeftFill />
            <span>{cycle}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            {renderIconByKind("time")}
            <span>{year_view}</span>
          </div>
          {regions?.map((region: { regiontype: string;}) => (
            <div key={region.regiontype} className="flex flex-row items-center gap-2">
              {renderIconByKind("region")}
              <span>{regionLabel.get(region.regiontype)}</span>
            </div>
          ))}
        </div>
        <h2 className="card-title mb-5">{title}</h2>
        <div className="flex flex-wrap flex-row gap-3">
          {tags?.map((tag: { tag_name: string; }) => (
            <Tag key={tag.tag_name} name={tag.tag_name} kind="thema" />
          ))}
          {dimensions?.map((dimension: { class_name: string; }) => (
            <Tag key={dimension.class_name} name={dimension.class_name} kind="dimension" />
          ))}
          {measures?.map((measure: { name: string; }) => (
            <Tag key={measure.name} name={measure.name} kind="measure" />
          ))}
          {/* {regions?.map((region: { class_name: string;}) => (
            <Tag key={region.class_name} name={region.class_name} kind="region" />
          ))} */}
        </div>

        <div className="card-actions justify-end mt-5">
          <button className="btn btn-primary btn-outline ml-auto" onClick={handleClick}><TbDatabaseShare />e-Statで表示する</button>
        </div>
      </div>
    </div>
  );
}
