"use client";

// Drawer.tsx
import React, { ReactNode, useState, useEffect, useRef } from "react";
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

const SWIPE_CLOSE_DISTANCE = 64;
const SWIPE_MAX_VERTICAL_DRIFT = 80;

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
  const swipeStartRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    // ブラウザ側でのみ実行されるので document.body を安全に参照できる
    setContainer(document.body);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isOpen || event.pointerType === "mouse") {
      return;
    }

    swipeStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const swipeStart = swipeStartRef.current;
    swipeStartRef.current = null;

    if (!swipeStart || swipeStart.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    const isMostlyHorizontal =
      Math.abs(deltaY) <= SWIPE_MAX_VERTICAL_DRIFT &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.5;
    const isClosingSwipe =
      side === "right"
        ? deltaX >= SWIPE_CLOSE_DISTANCE
        : deltaX <= -SWIPE_CLOSE_DISTANCE;

    if (isMostlyHorizontal && isClosingSwipe) {
      onToggle();
    }
  };

  const handlePointerCancel = () => {
    swipeStartRef.current = null;
  };

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
          onClick={() => {
            onToggle();
          }}
        ></label>
        <div
          data-drawer-content-id={id}
          className={`min-h-full w-[min(28rem,92vw)] touch-pan-y overflow-y-auto bg-base-200 p-4 text-base-content ${
            isOpen ? "shadow-xl" : "shadow-none"
          }`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
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
    container, // ポータルのターゲットをドキュメントのボディに設定
  );
}
