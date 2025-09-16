"use client";

import { useState, ReactNode, useEffect } from "react";
import { TbFilterPlus, TbFilterX } from "react-icons/tb";
import { FiInfo } from "react-icons/fi";

import { useSearchItem } from '../contexts/SearchItemsProvider';
import { Dropdown } from "./Dropdown";

interface DropdownContainerProps {
  kind: string;
  name: string;
  children?: ReactNode;
}

export function DropdownContainer({ kind, name }: DropdownContainerProps)  {

  const { items, findItem, addItem, removeItem } = useSearchItem();

  // ボタンが選択されているかどうかを管理する状態
  const [isSelected, setIsSelected] = useState(findItem(kind, name));

  // itemSet が変更されたときに isSelected を更新
  useEffect(() => {
    setIsSelected(findItem(kind, name));
  }, [items, name]);

  // 検索条件追加 or 削除のボタンクリック時の処理
  const searchConditionClick = () => {
    isSelected ? removeItem(kind, name) : addItem(kind, name);
    setIsSelected(!isSelected);
  };

  return (
    <Dropdown
      kind={kind}
      name={name}
      isSelected={isSelected}
      onClick={searchConditionClick}
      />  
  );
};
