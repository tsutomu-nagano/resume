
import { useState } from "react";
import { TbFilterPlus, TbFilterX } from "react-icons/tb";
import { FiInfo } from "react-icons/fi";
import { renderIconByKind } from "../common/convertor";
import { TagButton } from "./Button";
import { DimensionItemContainer } from "./DimensionItemContainer";
import { Drawer } from "./Drawer";

interface TagDropdownProps {
  isSelected: boolean;
  onClick: () => void;
  kind: string;
  name: string;
}

export function TagDropdown({ isSelected, onClick, kind, name }: TagDropdownProps)  {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen(prev => !prev);

  return (
    <div className="dropdown dropdown-bottom">
      <TagButton kind={kind} name={name} isSelected={isSelected} />
      <ul tabIndex={0} className="menu dropdown-content bg-base-100 rounded-box z-[1] w-64 p-2 shadow">
        <li role="button" onClick={onClick}>
          <a>
            {isSelected ? (
              <><TbFilterX />{"検索条件から削除する"}</>
            ) : (
              <><TbFilterPlus />{"検索条件に追加する"}</>
            )}
          </a>
        </li>
        <li role="button" onClick={toggleDrawer}>
          <a><FiInfo />詳細を見る</a>
        </li>
      </ul>

      {kind === "dimension" || kind === "region" ? (
        <DimensionItemContainer
          kind={kind}
          title={title}
          name={name}
          isOpen={isDrawerOpen}
          onToggle={toggleDrawer}
        />
      ) : (
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
      )}
    </div>
  );
};
