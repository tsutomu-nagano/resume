// src/app/StatCard.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { createApolloClient } from '@/lib/apolloClient';
import { GET_SEARCH_TAG_LIST } from '../../lib/queries';

import { useSearchItem } from '../contexts/SearchItemsProvider';

import { TimeSelector } from './TimeSelector';


export function TimeSelectorContainer() {

  const ref_names = ["TABLE_DIMENSIONs", "TABLELIST"]
  const resource_name = "DIMENSIONLIST"
  const resource_field = "CLASS_NAME"

  const [searchTerm, setSearchTerm] = useState('');
  const client = createApolloClient();

  const [fromYear, setFromYear] = useState<number | null>(null);
  const [toYear, setToYear] = useState<number | null>(null);


  // const searchConditionClick = () => {
  //   isSelected ? removeItem(kind, name) : addItem(kind, name);
  //   setIsSelected(!isSelected);
  // };

  const test = () => {
    alert(`${fromYear} - ${toYear}`);
  };


  return (
    <TimeSelector onChangeFrom={setFromYear} onChangeTo={setToYear} onEnter={test} />
  );
}


