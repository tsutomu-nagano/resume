"use client";

import { useState, ReactNode, useEffect } from "react";
import { TbFilterPlus, TbFilterX } from "react-icons/tb";
import { FiInfo } from "react-icons/fi";

import { createApolloClient } from '@/lib/apolloClient';
import { GET_ITEMS } from '../../lib/queries';


import { useSearchItem } from '../contexts/SearchItemsProvider';
import { Dropdown } from "./Dropdown";
import { Drawer } from "./Drawer";
import { DataTable as DimensionItemTable } from "./DimensionItemTable/data-table"
import { columns as DimensionItemTableColumns, DimensionItem } from "./DimensionItemTable/columns"

interface DropdownContainerProps {
  kind: string;
  name: string;
  children?: ReactNode;
}

export function DropdownContainer({ kind, name }: DropdownContainerProps)  {

  const { items, findItem, addItem, removeItem } = useSearchItem();
  const [ isDrawerOpen, setDrawerOpen] = useState(false);

  const [dimensionItems, setData] = useState<DimensionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const client = createApolloClient();
  
  const toggleDrawer = () => {
    setDrawerOpen(prev => !prev)
  }

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

  const onSearch = async (word:string) => {

    try {
      const searchQuery = GET_ITEMS("DIMENSION_ITEM", word);
      const query = searchQuery;

      const { data } = await client.query({query})
      const items: DimensionItem[] = data.items.map((item: {name: string;}, index:number) => ({
        id: String(index + 1), // IDを文字列化
        name: item.name,
      }));
      setData(items);

    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }

  }



  const showDetaile = async (name: string) => {
    console.log(name)
    await onSearch(name)
    setDrawerOpen(prev => !prev)
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
    <Drawer
      id="example"
      title={name}
      isOpen={isDrawerOpen}
      onToggle={toggleDrawer}
    >
       {/* Drawer内部でdataを表示 */}
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        {dimensionItems? (
          <DimensionItemTable
             columns={DimensionItemTableColumns}
             data={dimensionItems}
           />
        ) : (
          !loading && <p>データがありません</p>
        )} 
      </Drawer>
    </>

    );
};
