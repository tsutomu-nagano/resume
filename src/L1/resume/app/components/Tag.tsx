// src/app/StatCard.tsx
"use client";

import { BsTag } from "react-icons/bs";
import { SlNote } from "react-icons/sl";
import { FaRegFolder } from "react-icons/fa";
import { TbSum } from "react-icons/tb";
import { useSearchItem } from '../contexts/SearchItemsProvider';

import { useState, useEffect } from 'react'
import { kind_en2ja } from "../common/convertor";


interface TagProps {
  key: string;
  name: string;
  kind: string;
  show_description?: boolean;
}

export default function Tag({ key, name, kind, show_description }: TagProps) {

  const { items, findItem, addItem, removeItem } = useSearchItem();

  // ボタンが選択されているかどうかを管理する状態
  const [isSelected, setIsSelected] = useState(findItem(kind, name));

  // itemSet が変更されたときに isSelected を更新
  useEffect(() => {
    setIsSelected(findItem(kind,name));
  }, [items, name]);

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
      <>
        {show_description && show_description == true ? (

          <div className="tooltip" data-tip={kind_en2ja(kind)}>
            <div
              tabIndex={0}
              role="button"
              onClick={handleButtonClick}
              className={`btn m-1 ${isSelected ? 'btn-primary' : 'btn-outline'}`}
            >
              {renderIconByKind(kind)}{name}
            </div>
          </div>

        ) : (
          <div
            tabIndex={0}
            role="button"
            onClick={handleButtonClick}
            className={`btn m-1 ${isSelected ? 'btn-primary' : 'btn-outline'}`}
          >
            {renderIconByKind(kind)}{name}
          </div>

        )
        }
      </>
    </div>
  );
}
  