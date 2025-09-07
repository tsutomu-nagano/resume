
import { ReactPortal, useState, ReactNode  } from "react";
import { TbFilterPlus, TbFilterX } from "react-icons/tb";
import { FiInfo } from "react-icons/fi";
import { renderIconByKind } from "../common/convertor";
import { Button } from "./Button";
import { Drawer } from "./Drawer";
import { Chicle } from "next/font/google";

interface DropdownProps {
  isSelected: boolean;
  onClick: () => void;
  kind: string;
  name: string;
  children?: ReactNode
}

export function Dropdown({ isSelected, onClick, kind, name, children  }: DropdownProps) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => {
    setDrawerOpen(prev => !prev)
    // setChildren(
    //   <div className="overflow-x-auto">
    //     <table className="table">
    //       {/* head */}
    //       <thead>
    //         <tr>
    //           <th></th>
    //           <th>Name</th>
    //           <th>Job</th>
    //           <th>Favorite Color</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {/* row 1 */}
    //         <tr>
    //           <th>1</th>
    //           <td>Cy Ganderton</td>
    //           <td>Quality Control Specialist</td>
    //           <td>Blue</td>
    //         </tr>
    //         {/* row 2 */}
    //         <tr>
    //           <th>2</th>
    //           <td>Hart Hagerty</td>
    //           <td>Desktop Support Technician</td>
    //           <td>Purple</td>
    //         </tr>
    //         {/* row 3 */}
    //         <tr>
    //           <th>3</th>
    //           <td>Brice Swyre</td>
    //           <td>Tax Accountant</td>
    //           <td>Red</td>
    //         </tr>
    //       </tbody>
    //     </table>
    //   </div>);
  };

  const text = <div className="flex flex-row gap-2 items-center">{renderIconByKind(kind)}{name}</div>

  return (
    <div className="dropdown dropdown-bottom">
      <Button kind={kind} name={name} isSelected={isSelected} />
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
        {kind !== "time" && (
          <>
            <li role="button" onClick={toggleDrawer}>
              <a><FiInfo />詳細を見る</a>
            </li>
            <Drawer
              id="example"
              title={text}
              isOpen={isDrawerOpen}
              onToggle={toggleDrawer}
            >
              {children}
            </Drawer>
          </>
        )}
      </ul>
    </div>
  );
};
