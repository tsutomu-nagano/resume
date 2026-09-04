"use client";

import {
  Check,
  GitBranch,
  GitCommitHorizontal,
  GitMerge,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";
import {
  SearchHistoryItem,
  SearchHistoryNode,
  SearchResultView,
} from "../contexts/SearchItemsContext";
import { useSearchItem } from "../contexts/SearchItemsProvider";

function getItemLabel(item: SearchHistoryItem) {
  return `${item.kind}: ${item.itemName}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return value.replace("T", " ").slice(0, 16);
}

function getItemsKey(items: SearchHistoryItem[]) {
  return items
    .map((item) => getItemLabel(item))
    .sort()
    .join("|");
}

function isInteractiveElement(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("button, input"));
}

function SearchHistoryNodeRow({
  node,
  nodes,
  activeNodeId,
  currentItems,
  currentView,
  depth = 0,
  onCheckout,
  onRename,
  onUpdateConditions,
}: {
  node: SearchHistoryNode;
  nodes: SearchHistoryNode[];
  activeNodeId: string | null;
  currentItems: SearchHistoryItem[];
  currentView: SearchResultView;
  depth?: number;
  onCheckout: (nodeId: string) => void;
  onRename: (nodeId: string, name: string) => void;
  onUpdateConditions: (nodeId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(node.name);
  const children = nodes.filter((childNode) => childNode.parentId === node.id);
  const isActiveNode = activeNodeId === node.id;
  const isCurrent =
    isActiveNode &&
    node.view === currentView &&
    getItemsKey(node.items) === getItemsKey(currentItems);
  const isModified = isActiveNode && !isCurrent;
  const canUpdateConditions =
    currentItems.length > 0 &&
    getItemsKey(node.items) !== getItemsKey(currentItems);

  const checkout = () => onCheckout(node.id);
  const handleRowClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!isInteractiveElement(event.target)) {
      checkout();
    }
  };
  const startEditing = () => {
    setEditingName(node.name);
    setIsEditing(true);
  };
  const cancelEditing = () => {
    setEditingName(node.name);
    setIsEditing(false);
  };
  const saveName = () => {
    if (!editingName.trim()) {
      return;
    }

    onRename(node.id, editingName);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <div
        className={`cursor-pointer rounded-md border p-2 transition-colors hover:bg-base-200/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
          isCurrent
            ? "border-primary bg-primary/10"
            : isModified
              ? "border-warning bg-warning/10"
              : "border-base-300"
        }`}
        style={{ marginLeft: `${depth * 1.25}rem` }}
        title="この検索条件を復元"
        onClick={handleRowClick}
      >
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square shrink-0"
            title="この検索条件を復元"
            aria-label={`${node.name}の検索条件を復元`}
            onClick={checkout}
          >
            <GitCommitHorizontal size={16} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <input
                    className="input input-bordered input-xs min-w-40 max-w-full"
                    value={editingName}
                    aria-label="検索履歴名"
                    autoFocus
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        saveName();
                      } else if (event.key === "Escape") {
                        cancelEditing();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square"
                    title="履歴名を保存"
                    aria-label="履歴名を保存"
                    disabled={!editingName.trim()}
                    onClick={saveName}
                  >
                    <Save size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square"
                    title="編集を取り消す"
                    aria-label="編集を取り消す"
                    onClick={cancelEditing}
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="min-w-0 max-w-full truncate text-sm font-medium">
                    {node.name}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square"
                    title="履歴名を編集"
                    aria-label={`${node.name}の名前を編集`}
                    onClick={startEditing}
                  >
                    <Pencil size={14} />
                  </button>
                </>
              )}
              {canUpdateConditions ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  title="現在の検索条件をこの履歴に追加"
                  onClick={() => onUpdateConditions(node.id)}
                >
                  <GitMerge size={14} />
                  現在条件を追加
                </button>
              ) : null}
              {isCurrent ? (
                <span className="badge badge-primary">表示中</span>
              ) : null}
              {isModified ? (
                <span className="badge badge-warning">変更あり</span>
              ) : null}
              <span className="badge badge-outline">
                {node.resultCount ?? "-"}件
              </span>
              <span className="text-xs text-base-content/60">
                {formatDateTime(node.createdAt)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {(node.addedItems.length > 0 ? node.addedItems : node.items).map(
                (item) => (
                  <span
                    key={`${node.id}:${item.kind}:${item.itemName}`}
                    className="badge badge-ghost max-w-full truncate"
                  >
                    + {getItemLabel(item)}
                  </span>
                ),
              )}
            </div>
            {node.memo ? (
              <p className="mt-1 truncate text-xs text-base-content/60">
                {node.memo}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {children.map((childNode) => (
        <SearchHistoryNodeRow
          key={childNode.id}
          node={childNode}
          nodes={nodes}
          activeNodeId={activeNodeId}
          currentItems={currentItems}
          currentView={currentView}
          depth={depth + 1}
          onCheckout={onCheckout}
          onRename={onRename}
          onUpdateConditions={onUpdateConditions}
        />
      ))}
    </div>
  );
}

export function SearchHistoryPanel() {
  const {
    searchHistoryNodes,
    activeSearchNodeId,
    getItemsArray,
    view,
    commitSearchNode,
    updateSearchNodeConditions,
    checkoutSearchNode,
    renameSearchNode,
    clearSearchHistory,
  } = useSearchItem();
  const [notification, setNotification] = useState("");
  const rootNodes = searchHistoryNodes.filter((node) => node.parentId === null);
  const currentItems = getItemsArray();
  const activeNode = searchHistoryNodes.find(
    (node) => node.id === activeSearchNodeId,
  );
  const isCurrentSaved = Boolean(
    activeNode &&
    activeNode.view === view &&
    getItemsKey(activeNode.items) === getItemsKey(currentItems),
  );

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotification(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  const handleCommit = () => {
    const result = commitSearchNode();

    setNotification(
      result === "saved"
        ? "検索条件を履歴に保存しました。"
        : result === "existing"
          ? "同じ条件の履歴を表示しました。"
          : "この検索条件は保存済みです。",
    );
  };
  const handleClearHistory = () => {
    if (
      window.confirm(
        "検索履歴をすべて初期化します。現在の検索条件はそのまま残ります。",
      )
    ) {
      clearSearchHistory();
      setNotification("検索履歴をすべて削除しました。");
    }
  };

  return (
    <section className="rounded-md border border-base-300 bg-base-100 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <GitBranch size={18} />
          <h2 className="text-sm font-semibold">履歴ツリー</h2>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={isCurrentSaved}
            title={isCurrentSaved ? "現在の検索条件は保存済みです" : undefined}
            onClick={handleCommit}
          >
            {isCurrentSaved ? <Check size={16} /> : <Pencil size={16} />}
            {isCurrentSaved ? "保存済み" : "新しい履歴として保存"}
          </button>
          {searchHistoryNodes.length > 0 ? (
            <button
              type="button"
              className="btn btn-outline btn-error btn-sm"
              title="検索履歴をすべて初期化"
              aria-label="検索履歴をすべて初期化"
              onClick={handleClearHistory}
            >
              <Trash2 size={16} />
            </button>
          ) : null}
        </div>
      </div>
      {notification ? (
        <div className="alert alert-success mt-3 py-2 text-sm" role="status">
          <Check size={16} aria-hidden="true" />
          <span>{notification}</span>
        </div>
      ) : null}
      {rootNodes.length === 0 ? (
        <p className="mt-3 text-sm text-base-content/60">
          現在の検索条件を保存すると、ここに履歴ツリーが表示されます。
        </p>
      ) : (
        <div className="mt-3 space-y-2 overflow-x-auto">
          {rootNodes.map((node) => (
            <SearchHistoryNodeRow
              key={node.id}
              node={node}
              nodes={searchHistoryNodes}
              activeNodeId={activeSearchNodeId}
              currentItems={currentItems}
              currentView={view}
              onCheckout={checkoutSearchNode}
              onRename={renameSearchNode}
              onUpdateConditions={updateSearchNodeConditions}
            />
          ))}
        </div>
      )}
    </section>
  );
}
