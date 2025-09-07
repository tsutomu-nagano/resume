"use client";

import { useEffect } from 'react'
import { useSearchItem } from '../contexts/SearchItemsProvider';
import { renderIconByKind } from "../common/convertor"


interface SearchCountResultProps {
  stat: number;
  db: number;
}

export function SearchCountResult({stat, db} : SearchCountResultProps) {
    return (
        <div className="flex flex-row gap-2 items-center">

            <div className="flex flex-row gap-2 items-center p-2">
                {renderIconByKind("stat")}{"統計調査"}
                <div className="badge badge-primary">{stat}</div>
            </div>

            <div className="flex flex-row gap-2 items-center p-2">
                {renderIconByKind("db")}{"統計データ"}
                <div className="badge badge-lg badge-primary">{db}</div>
            </div>

        </div>
    )
};