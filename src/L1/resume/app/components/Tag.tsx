// src/app/StatCard.tsx
"use client";

import { BsTag } from "react-icons/bs";
import { SlNote } from "react-icons/sl";
import { FaRegFolder } from "react-icons/fa";
import { TbSum } from "react-icons/tb";
import { useSearchItem } from '../contexts/SearchItemsProvider'; 

import { useState, useEffect } from 'react'



interface TagProps {
  key: string;
  name: string;
  kind: string;
}

export default function Tag({ key, name, kind }: TagProps) {

  const {items, findItem, addItem, removeItem } = useSearchItem();

  // ボタンが選択されているかどうかを管理する状態
  const [isSelected, setIsSelected] = useState(findItem(kind, name));

  // itemSet が変更されたときに isSelected を更新
  // useEffect(() => {
  //   setIsSelected(findItem(kind,name));
  // }, [itemSet, name]);

    // ボタンクリック時に選択状態をトグルするハンドラ
  const handleButtonClick = () => {
    isSelected ? removeItem(kind, name) : addItem(kind, name);
    setIsSelected(!isSelected);
  };


  const renderIconByKind = (kind: string) => {
    switch (kind) {
      case 'stat':
        return <SlNote />; 
      case 'measure':
        return <TbSum />;
      case 'thema':
        return <FaRegFolder />;
      default:
        return <BsTag />;
    }
  };

  return (
    <div className="dropdown">
      <div tabIndex={0} role="button"
      onClick={handleButtonClick}
      className={`btn m-1 ${isSelected ? 'btn-primary' : 'btn-outline'}`}
      >
        {renderIconByKind(kind)}{name}
      </div>
      {/* <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-1 shadow">
        <li><a>Item 1</a></li>
        <li><a>Item 2</a></li>
      </ul> */}
    </div>
  );
}
