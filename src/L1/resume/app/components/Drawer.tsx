// Drawer.tsx
import { setupListeners } from "@reduxjs/toolkit/query";
import React, { ReactNode, useState } from "react";
import { createPortal } from "react-dom";

interface DrawerProps {
  id: string; // Drawerの一意なID
  title: ReactNode;
  children?: ReactNode; // Drawerのメインコンテンツ
  sidebarContent?: ReactNode; // サイドバーのコンテンツ
  isOpen: boolean; // Drawerの開閉状態
  onToggle: () => void; // Drawerの開閉をトグルする関数
}

export default function Drawer({
  id,
  title,
  children,
  sidebarContent,
  isOpen,
  onToggle,
}: DrawerProps) {
  // ポータルのためにドキュメントのルートにレンダリング

  return createPortal(
    <div className="drawer drawer-end">
      <input
        id={`my-drawer-${id}`}
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        // onChange={() => {
        //     console.log("change checked")
        // }}
      />
      <div className="drawer-content z-50">
        {children}
      </div>
      <div className="drawer-side z-40">
        <label
          htmlFor={`my-drawer-${id}`}
          aria-label="close sidebar"
          className="drawer-overlay"
          onClick={() => {
            console.log("click overlay")
            // isOpen = false;
            onToggle()
        }}
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-2/5 p-4">
          <h1 className="text-3xl font-bold">{title}</h1>
          <div className="divider divider-primary" />
          {/* Sidebar content */}
          {sidebarContent || (
            <>
              <li>
                <a>Sidebar Item 1</a>
              </li>
              <li>
                <a>Sidebar Item 2</a>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>,
    document.body // ポータルのターゲットをドキュメントのボディに設定
  );
}
