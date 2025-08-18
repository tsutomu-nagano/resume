// src/app/StatCard.tsx
"use client";

import { FiInfo } from "react-icons/fi";

import { TbFilterPlus } from "react-icons/tb";
import { TbFilterX } from "react-icons/tb";

import { useSearchItem } from '../contexts/SearchItemsProvider';

import { useState, useEffect } from 'react'
import { renderIconByKind } from "../common/convertor";
import DimensionItemInfo from "./DimensionItemInfo";
import Drawer from "./Drawer";

interface TagProps {
  kind: string;
  name: string;
  operator: string;
  simple?: boolean;
}

const Tag: React.FC<TagProps> = ({ kind, name, operator, simple = false }) => {

  const { items, findItem, addItem, removeItem } = useSearchItem();

  // ボタンが選択されているかどうかを管理する状態
  const [isSelected, setIsSelected] = useState(findItem(kind, name, operator));

  // itemSet が変更されたときに isSelected を更新
  useEffect(() => {
    // findItem に operator 引数を追加
    setIsSelected(findItem(kind, name, operator));
  }, [kind, name, operator, findItem]); // 依存配列に operator を追加

  // ボタンクリック時に選択状態をトグルするハンドラ
  const handleButtonClick = () => {
    isSelected ? removeItem(kind, name, operator) : addItem(kind, name, operator);
    setIsSelected(!isSelected);
  };


  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Drawerの開閉をトグルする関数
  const toggleDrawer = () => setDrawerOpen((prev) => {
    return (!prev)
  });

  const title = <div className="flex flex-row gap-2 items-center">{renderIconByKind(kind)}{name}</div>


  return simple ? (
      <div tabIndex={0} role="button"
        onClick={handleButtonClick}
        className={`btn m-1 ${isSelected ? 'btn-primary' : 'btn-outline'}`}
      >
        {title} 
      </div>
    ) : (
      <div className="dropdown dropdown-bottom">
        <div tabIndex={0} role="button"
          className={`btn m-1 ${isSelected ? 'btn-primary' : 'btn-outline'}`}
        >
          {title} 
        </div>
        <ul tabIndex={0} className="menu dropdown-content bg-base-100 rounded-box z-[1] w-64 p-2 shadow">
          <li
            // tabIndex={0}
            role="button"
            onClick={handleButtonClick}
          >
            <a>{
              isSelected ? (
                <>
                  <TbFilterX />{"検索条件から削除する"}
                </>
              ) : (
                <>
                  <TbFilterPlus />{"検索条件に追加する"}
                </>
              )}</a>
          </li>
          <li role="button" onClick={toggleDrawer} >
            <a><FiInfo />詳細を見る</a>
          </li>
        </ul>
        {
          kind == "dimension" || kind == "region" ? (
            <>
              <DimensionItemInfo
                id="example"
                kind = {kind}
                title={title}
                name={name}
                isOpen={isDrawerOpen}
                onToggle={toggleDrawer}
              />
            </>
          ) : (
            <>
              <Drawer
                    id="example"
                    title={title}
                    isOpen={isDrawerOpen}
                    onToggle={toggleDrawer}
                    sidebarContent={
                      <>
                        <span className="text-xl">Overview</span>
                        <span className="text-base">hogehoge</span>
                        <li><a>Custom Sidebar Item 1</a></li>
                        <li><a>Custom Sidebar Item 2</a></li>
                      </>
                    }
                  />
            </>

          )
        }
      </div>
    )
  
}

export default Tag;