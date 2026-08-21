"use client";

import {
  GitBranch,
  GitCommitHorizontal,
  GitMerge,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  SearchHistoryItem,
  SearchHistoryNode,
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

function SearchHistoryNodeRow({
  node,
  nodes,
  activeNodeId,
  currentItems,
  depth = 0,
  onCheckout,
  onRename,
  onUpdateConditions,
}: {
  node: SearchHistoryNode;
  nodes: SearchHistoryNode[];
  activeNodeId: string | null;
  currentItems: SearchHistoryItem[];
  depth?: number;
  onCheckout: (nodeId: string) => void;
  onRename: (nodeId: string, name: string) => void;
  onUpdateConditions: (nodeId: string) => void;
}) {
  const [editingName, setEditingName] = useState(node.name);
  const children = nodes.filter((childNode) => childNode.parentId === node.id);
  const isActive = activeNodeId === node.id;
  const canUpdateConditions =
    currentItems.length > 0 &&
    getItemsKey(node.items) !== getItemsKey(currentItems);

  return (
    <div className="space-y-2">
      <div
        className={`flex items-start gap-2 rounded-md border p-2 ${
          isActive ? "border-primary bg-primary/10" : "border-base-300"
        }`}
        style={{ marginLeft: `${depth * 1.25}rem` }}
      >
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          title="この検索ノードへ移動"
          aria-label="この検索ノードへ移動"
          onClick={() => onCheckout(node.id)}
        >
          <GitCommitHorizontal size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="input input-bordered input-xs min-w-40 max-w-full"
              value={editingName}
              onChange={(event) => setEditingName(event.target.value)}
            />
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              title="検索ノード名を保存"
              aria-label="検索ノード名を保存"
              onClick={() => onRename(node.id, editingName)}
            >
              <Save size={14} />
            </button>
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
            {isActive ? (
              <span className="badge badge-primary">表示中</span>
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
      {children.map((childNode) => (
        <SearchHistoryNodeRow
          key={childNode.id}
          node={childNode}
          nodes={nodes}
          activeNodeId={activeNodeId}
          currentItems={currentItems}
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
    commitSearchNode,
    updateSearchNodeConditions,
    checkoutSearchNode,
    renameSearchNode,
    clearSearchHistory,
  } = useSearchItem();
  const rootNodes = searchHistoryNodes.filter((node) => node.parentId === null);
  const currentItems = getItemsArray();
  const handleClearHistory = () => {
    if (
      window.confirm(
        "検索履歴をすべて初期化します。現在の検索条件はそのまま残ります。",
      )
    ) {
      clearSearchHistory();
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
            onClick={commitSearchNode}
          >
            <Pencil size={16} />
            新しい履歴として保存
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
