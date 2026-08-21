"use client";

import { ChevronDown, ChevronRight, ExternalLink, Folder } from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildTableExplorerTree,
  type TableExplorerNode,
  type TableExplorerResult,
} from "../../lib/tableExplorer";
import { renderIconByKind } from "../common/convertor";
import { DropdownContainer as Tag } from "./Dropdown.container";

type TableExplorerProps = {
  tables: TableExplorerResult[];
};

function yearView(table: TableExplorerResult) {
  if (table.year_s === table.year_e) {
    return table.year_s === "0" ? "-" : table.year_s;
  }

  return `${table.year_s} - ${table.year_e}`;
}

function openTable(statdispid: string) {
  window.open(`https://www.e-stat.go.jp/dbview?sid=${statdispid}`, "_blank");
}

function TableLeaf({ table }: { table: TableExplorerResult }) {
  return (
    <article className="rounded-md border border-base-300 bg-base-100 p-3 shadow-sm transition hover:border-primary/40 hover:bg-primary/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/70">
            <span className="inline-flex items-center gap-1">
              {renderIconByKind("db")}
              {table.statdispid}
            </span>
            <span className="inline-flex items-center gap-1">
              {renderIconByKind("time")}
              {yearView(table)}
            </span>
          </div>
          <h3 className="text-sm font-semibold leading-6">{table.title}</h3>
          <div className="flex flex-wrap gap-2">
            {table.table_measures.slice(0, 3).map((measure) => (
              <Tag key={measure.name} name={measure.name} kind="measure" />
            ))}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm shrink-0"
          onClick={() => openTable(table.statdispid)}
          aria-label={`${table.title}をe-Statで表示する`}
        >
          <ExternalLink className="size-4" />
        </button>
      </div>
    </article>
  );
}

function ExplorerNode({
  node,
  level,
}: {
  node: TableExplorerNode;
  level: number;
}) {
  const [isOpen, setIsOpen] = useState(level < 1);
  const visibleTables =
    node.children.length > 0 ? node.tables.slice(0, 2) : node.tables;

  return (
    <section className="rounded-md border border-base-300 bg-base-100 shadow-sm">
      <button
        type="button"
        className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-base-200"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <ChevronDown className="size-4 shrink-0" />
        ) : (
          <ChevronRight className="size-4 shrink-0" />
        )}
        <Folder className="size-5 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate font-semibold">
          {node.label}
        </span>
        <span className="badge badge-outline shrink-0">{node.count}</span>
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-base-300 p-3">
            {node.children.length > 0 ? (
              <div className="space-y-3">
                {node.children.map((childNode) => (
                  <ExplorerNode
                    key={childNode.id}
                    node={childNode}
                    level={level + 1}
                  />
                ))}
              </div>
            ) : null}
            <div className="space-y-2">
              {visibleTables.map((table) => (
                <TableLeaf key={table.statdispid} table={table} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TableExplorer({ tables }: TableExplorerProps) {
  const tree = useMemo(() => buildTableExplorerTree(tables), [tables]);

  if (tree.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {tree.map((node) => (
        <ExplorerNode key={node.id} node={node} level={0} />
      ))}
    </div>
  );
}
