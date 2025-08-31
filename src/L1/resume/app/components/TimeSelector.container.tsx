// src/app/StatCard.tsx
"use client";

// import React, { useState, useMemo } from 'react';
import { useSearchItem } from '../contexts/SearchItemsProvider';
import { TimeSelector } from './TimeSelector';


export function TimeSelectorContainer() {

  const { addItem, removeItem } = useSearchItem();

  const HandleSearch = (fromYear: String, toYear:String) => {
    addItem("time", `${fromYear}-${toYear}`);
  };


  return (
    <TimeSelector onSubmit={HandleSearch} />
  );
}


