// src/app/StatCard.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { createApolloClient } from '@/lib/apolloClient';
import { GET_SEARCH_TAG_LIST } from '../../lib/queries';


import { FaChevronDown } from "react-icons/fa6";
import { TagContainer as Tag } from './Tag.container';

import { useSearchItem } from '../contexts/SearchItemsProvider';

import { renderIconByKind, descriptionByKind } from "../common/convertor";
import { SearchConditionCheckbox } from "./SearchConditionCheckbox";
import { SurveyUnitIcon } from "../../lib/surveyUnitIcons";

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


  return (
    <div className="dropdown w-full sm:w-auto">
      <div tabIndex={0} role="button" className="btn btn-outline m-0 flex w-full flex-row flex-nowrap gap-2 whitespace-nowrap sm:m-1 sm:w-auto">
        {renderIconByKind(kind)}{labelja}から探す<FaChevronDown />
      </div>
      <div
        tabIndex={0}
        className="dropdown-content card card-compact z-[1] w-[calc(100vw-1.5rem)] max-w-80 border border-base-300 bg-base-100 p-2 shadow sm:w-80">
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
            <SearchConditionCheckbox key={unit} kind="survey_unit" name={unit} icon={<SurveyUnitIcon value={unit} />
} />
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

