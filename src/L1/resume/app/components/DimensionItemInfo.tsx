// Drawer.tsx
import { useQuery } from '@apollo/client';
import React, { ReactNode, useEffect } from "react";
import { GET_ITEMS } from "@/lib/queries"
import { Drawer } from "./Drawer";
import { LuComponent } from "react-icons/lu";

interface DimensionItemInfoProps {
  id: string; // Drawerの一意なID
  kind: string;
  title: ReactNode;
  name: string;
  children?: ReactNode; // Drawerのメインコンテンツ
  isOpen: boolean; // Drawerの開閉状態
  onToggle: () => void; // Drawerの開閉をトグルする関数
}

export function DimensionItemInfo({
  id,
  kind,
  title,
  name,
  children,
  isOpen,
  onToggle,
}: DimensionItemInfoProps) {
  // ポータルのためにドキュメントのルートにレンダリング

  const resource_name: string = kind === "dimension" ? "DIMENSION_ITEM" : kind === "region" ? "REGION_ITEM" : "";
  // const resource_name: string = kind === "dimension" ? "DIMENSION_ITEM" : "";

  // console.log(GET_ITEMS(resource_name, name))

  const { data, loading, error, refetch } = useQuery(GET_ITEMS(resource_name, name), {
    skip: !isOpen,  // 初回ロード時にクエリをスキップする
    // onCompleted: (data) => {
    //   console.log("データ取得成功:", data); // クエリ成功時のデータをログ出力
    // },
    // onError: (error) => {
    //   console.error("クエリエラー:", error); // クエリ失敗時のエラーログ
    // },
  });

  
  useEffect(() => {
    if (isOpen) {
      refetch();
    }  
  }, [isOpen]);

  return (
    <Drawer
      id="example"
      title={title}
      isOpen={isOpen}
      onToggle={onToggle}
      sidebarContent={
        <>
          {loading ? (
            <span className="loading loading-spinner text-primary">読み込み中です</span>
          ) : error instanceof Error ? (
            <p>Error: {error.message}</p>
          ) : data && data.item ? (
            <>
              <div className="divider divider-start divider-primary text-xl">項目一覧</div>
              <div className="flex flex-row flex-wrap gap-2">
                {
                  data.item.map((item: {name: string}) => (
                    <div key={item.name} className="btn btn-outline"><LuComponent/>{item.name}</div>
                  ))
                }
              </div>
            </>
          ) : (
            <p>No items found.</p>
          )}
        </>
      }
    />

  )
}
