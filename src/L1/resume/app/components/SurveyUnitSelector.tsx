// src/app/StatCard.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { createApolloClient } from '@/lib/apolloClient';
import { GET_SEARCH_TAG_LIST } from '../../lib/queries';


import { FaChevronDown } from "react-icons/fa6";
import { TagContainer as Tag } from './Tag.container';

import { useSearchItem } from '../contexts/SearchItemsProvider';

import { renderIconByKind, descriptionByKind } from "../common/convertor";


interface SurveyUnitProps {
  names: string[];
}


interface SurveyUnitSelectorProps {
  labelja: string;
  labelen: string;
  ref_names: string[];
  resource_name: string;
  resource_field: string;
  kind: string
}

export default function SurveyUnitSelector({ labelja, labelen = "", ref_names, resource_name, resource_field, kind }: SurveyUnitSelectorProps) {

    const units: string[] = [
        "個人",
        "世帯",
        "事業所",
        "企業",
        "法人・団体",
        "地方公共団体",
        "その他"
    ]


//   const handleSearch = async () => {
//     try {
       

//       const { data } = await client.query(searchQuery)
//       setData(data)

//     } catch (err) {
//       setError(err as Error);
//     } finally {
//       setLoading(false);
//     }

//   };


//   const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
//     if (event.key === 'Enter') {
//       handleSearch();
//     }
//   };


  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="flex flex-row flex-nowrap gap-2 whitespace-nowrap btn btn-outline m-1">
        {renderIconByKind(kind)}{labelja}から探す<FaChevronDown />
      </div>
      <div
        tabIndex={0}
        className="dropdown-content card card-compact bg-base-100 z-[1] w-80 p-2 shadow">
        <div className="card-body">
          <span>{descriptionByKind(kind)}</span>
          
          {/* {itemsArray && itemsArray.length > 0 && (
            <>
              <div className="divider divider-start divider-primary">現在選択している{labelja}</div>
              <div className="flex flex-row flex-wrap">
                {itemsArray.map(({ kind, itemName }) => (
                  <Tag key={itemName} name={itemName} kind={kind} simple={true}/>
                ))}
              </div>
            </>
          )} */}

        <div className="divider divider-start divider-primary">調査対象</div>
        <fieldset className="fieldset bg-base-100 border-base-300 p-4">
            {units.map(( unit ) =>(
            <label key={unit} className="label">
            <input type="checkbox" name="scopePrefectures" className="checkbox" onChange={() => {}}/>
                {unit}
            </label>
            ))}
        </fieldset>



          {/* <div className="flex flex-wrap">
            {data?.items.map(
              (item: { name: string; }) => (
                <Tag key={item.name} name={item.name} kind={kind} simple={true}/>
              )
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}


