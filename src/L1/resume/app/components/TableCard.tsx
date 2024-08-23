// src/app/StatCard.tsx
"use client";

import { BiHash } from "react-icons/bi";
import { RiLoopLeftFill } from "react-icons/ri";
import { RiTimeLine } from "react-icons/ri";
import Tag from './Tag';

interface TableCardProps {
  key: string;
  statcode: string;
  cycle: string;
  survey_date: string;
  title: string;
  tags: {tag_name: string}[]; 
  measures: {name: string}[]; 

}

export default function TableCard({ key, statcode, cycle, survey_date, title, tags, measures }: TableCardProps) {
  return (
    <div className="card bg-base-100 w-200 shadow-xl">
      <div className="card-body">
        <div className="flex flex-row gap-5 mb-5">
          <div className="flex flex-row items-center gap-2">
              <BiHash />
              <span>{statcode}</span>
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


        <div className="card-actions justify-end">
          <button className="btn btn-primary">Buy Now</button>
        </div>
      </div>
    </div>
 );
}
