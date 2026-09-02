"use client";

import { useEffect, useId, useState, ReactNode } from "react";
import { useSearchItem } from "../contexts/SearchItemsProvider";
import { Dropdown } from "./Dropdown";
import { MetadataDetailDrawer } from "./MetadataDetailDrawer";

interface DropdownContainerProps {
  kind: string;
  name: string;
  statcode?: string;
  statname?: string;
  children?: ReactNode;
}

export function DropdownContainer({
  kind,
  name,
  statcode,
  statname,
}: DropdownContainerProps) {
  const { items, findItem, addItem, removeItem } = useSearchItem();
  const drawerId = useId();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const canShowDetail = kind !== "time";

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

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

  const showDetaile = () => {
    setDrawerOpen((prev) => !prev);
  };

  return (
    <>
      <Dropdown
        kind={kind}
        name={name}
        isSelected={isSelected}
        onClick={searchConditionClick}
        showDetaile={showDetaile}
      />
      {canShowDetail ? (
        <MetadataDetailDrawer
          id={drawerId}
          kind={kind}
          name={name}
          statcode={statcode}
          statname={statname}
          isOpen={isDrawerOpen}
          onToggle={toggleDrawer}
        />
      ) : null}
    </>
  );
}
