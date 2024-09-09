// Drawer.tsx
import React, { ReactNode, useEffect } from "react";
import { useFetchItems } from "@/lib/useFetchDimensionItems"
import Drawer from "./Drawer";
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

export default function DimensionItemInfo({
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
  const { data, fetch, loading, error } = useFetchItems(resource_name, name);

  useEffect(() => {
    fetch();
  }, []);

  return (
    <Drawer
      id="example"
      title={title}
      isOpen={isOpen}
      onToggle={onToggle}
      sidebarContent={
        <>
          {loading ? (
            <span className="loading loading-spinner text-primary"></span>
          ) : error instanceof Error ? (
            <p>Error: {error.message}</p>
          ) : (
            <>
              <div className="divider divider-start divider-primary text-xl">項目一覧</div>
              <div className="flex flex-row flex-wrap gap-2">
                {
                  data.map((item: {name: string}) => (
                    <div key={item.name} className="btn btn-outline"><LuComponent/>{item.name}</div>
                  ))
                }
              </div>
            </>
          )
          }
        </>
      }
    />

  )
}
