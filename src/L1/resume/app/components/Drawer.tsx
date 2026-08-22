"use client";

// Drawer.tsx
import React, { ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface DrawerProps {
  id: string; // Drawerの一意なID
  title: ReactNode;
  children?: ReactNode; // Drawerのメインコンテンツ
  sidebarContent?: ReactNode; // サイドバーのコンテンツ
  isOpen: boolean; // Drawerの開閉状態
  onToggle: () => void; // Drawerの開閉をトグルする関数
  side?: "left" | "right";
}

export function Drawer({
  id,
  title,
  children,
  sidebarContent,
  isOpen,
  onToggle,
  side = "right",
}: DrawerProps) {
  // ポータルのためにドキュメントのルートにレンダリング

  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // ブラウザ側でのみ実行されるので document.body を安全に参照できる
    setContainer(document.body);
  }, []);

  if (!container) return null;

  return createPortal(
    <div className={`drawer ${side === "right" ? "drawer-end" : ""}`}>
      <input
        id={`my-drawer-${id}`}
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        readOnly
      />
      <div className="drawer-side z-40">
        <label
          htmlFor={`my-drawer-${id}`}
          aria-label="close sidebar"
          className="drawer-overlay"
          onClick={() => {onToggle()}}
        ></label>
        <div
          className={`min-h-full w-[min(28rem,92vw)] overflow-y-auto bg-base-200 p-4 text-base-content ${
            isOpen ? "shadow-xl" : "shadow-none"
          }`}
        >
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="divider divider-primary" />
          {children || sidebarContent || (
            <ul className="menu">
              <li>
                <a>Sidebar Item 1</a>
              </li>
              <li>
                <a>Sidebar Item 2</a>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>,
    container // ポータルのターゲットをドキュメントのボディに設定
  );
}
