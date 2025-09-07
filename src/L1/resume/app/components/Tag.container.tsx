"use client";

import { useSearchItem } from '../contexts/SearchItemsProvider';
import { useState, useEffect } from 'react'
import { Tag } from "./Tag";

interface TagContainerProps {
  name: string;
  kind: string;
  simple?: boolean;
}

export function TagContainer({ name, kind, simple = false }: TagContainerProps) {

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


  return <Tag
    name={name}
    kind={kind}
    simple={simple}
    isSelected={isSelected}
    searchConditionClick={searchConditionClick}
  />;
  
}
