// src/app/StatCard.tsx
// "use client";

import { BiHash } from "react-icons/bi";
import { RiGovernmentLine } from "react-icons/ri";

interface StatCardProps {
  statcode: string;
  statname: string;
  govname: string;
}

export function StatCard({ statcode, statname, govname }: StatCardProps) {
  return (
    <div className="card w-full border border-base-300 bg-base-100 shadow-xl">
      <div className="card-body gap-4 p-4 sm:p-8">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <div className="flex flex-row items-center gap-2">
              <BiHash />
              <span>{statcode}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
              <RiGovernmentLine />
              <span>{govname}</span>
          </div>
        </div>
        <h2 className="card-title text-base leading-7 sm:text-xl">{statname}</h2>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Buy Now</button>
        </div>
      </div>
    </div>
 );
}
