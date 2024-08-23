// src/app/StatCard.tsx
"use client";

import { BiHash } from "react-icons/bi";
import { RiLoopLeftFill } from "react-icons/ri";
import { RiTimeLine } from "react-icons/ri";
import { TbDatabaseShare } from "react-icons/tb";

import Tag from './Tag';

interface TableCardProps {
  key: string;
  statdispid: string;
  statcode: string;
  cycle: string;
  survey_date: string;
  title: string;
  tags: {tag_name: string}[]; 
  measures: {name: string}[]; 

}

export default function TableCard({ key, statdispid, statcode, cycle, survey_date, title, tags, measures }: TableCardProps) {

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
              <RiTimeLine />
              <span>{survey_date}</span>
          </div>
        </div>
        <h2 className="card-title mb-5">{title}</h2>
        <div className="flex flex-wrap flex-row gap-3">
          {tags.map((tag: { tag_name: string;}) => (
            <Tag key={tag.tag_name} name={tag.tag_name} kind="thema" />
          ))}
          {measures.map((measure: { name: string;}) => (
            <Tag key={measure.name} name={measure.name} kind="measure" />
          ))}
        </div>

        <div className="card-actions justify-end mt-5">
          <button className="btn btn-primary btn-outline ml-auto" onClick={handleClick}><TbDatabaseShare />e-Statで表示する</button>
        </div>
      </div>
    </div>
 );
}
