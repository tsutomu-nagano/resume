"use client";

import { BiHash } from "react-icons/bi";
import { TbTable } from "react-icons/tb";

interface SurveyCardProps {
  statcode: string;
  statname: string;
  tableCount: number;
  onSelect: () => void;
}

export function SurveyCard({
  statcode,
  statname,
  tableCount,
  onSelect,
}: SurveyCardProps) {
  return (
    <article className="card bg-base-100 w-full shadow-xl">
      <div className="card-body">
        <div className="flex flex-row items-center gap-2 text-sm">
          <BiHash />
          <span>{statcode}</span>
        </div>
        <h2 className="card-title">{statname}</h2>
        <div className="card-actions items-center justify-between mt-4">
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
