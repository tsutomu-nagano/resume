import { BsTag } from "react-icons/bs";
import { SlNote } from "react-icons/sl";
import { FaRegFolder } from "react-icons/fa";
import { TbSum } from "react-icons/tb";
import { LuDatabase } from "react-icons/lu";
LuDatabase

const iconMap: Record<string, JSX.Element> = {
    stat: <SlNote/>,
    measure: <TbSum/>,
    dimension: <BsTag/>,
    thema: <FaRegFolder/>,
    db: <LuDatabase/>
  };
  
export const renderIconByKind = (kind: string) => {
    return iconMap[kind] || <BsTag />;
};



export function descriptionByKind(kind: string):string {
 
  switch (kind) {
      case 'stat':
          return "統計調査"
      case 'measure':
          return "統計データにおける量的変数";
      case 'dimension':
          return "統計データにおける質的変数";
      case 'thema':
          return "統計作成機関で設定しているカテゴリ";
      default:
          return "その他";
  }

}


export function kind_en2ja(kind: string):string {
 
    switch (kind) {
        case 'stat':
            return "統計調査"
        case 'measure':
            return "集計事項";
        case 'dimension':
            return "分類事項";
        case 'thema':
            return "提供分類等";
        default:
            return "その他";
    }

}

