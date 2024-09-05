// src/app/StatCard.tsx
// "use client";

import { BiHash } from "react-icons/bi";
import { RiGovernmentLine } from "react-icons/ri";

interface StatCardProps {
  statcode: string;
  statname: string;
  govname: string;
}

export default function StatCard({ statcode, statname, govname }: StatCardProps) {
  return (
    <div className="card bg-base-100 w-200 shadow-xl">
      <div className="card-body">
        <div className="flex flex-row gap-5">
          <div className="flex flex-row items-center gap-2">
              <BiHash />
              <span>{statcode}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
              <RiGovernmentLine />
              <span>{govname}</span>
          </div>
        </div>
        <h2 className="card-title">{statname}</h2>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Buy Now</button>
        </div>
      </div>
    </div>
 );
}
