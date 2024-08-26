import { BsTag } from "react-icons/bs";
import { SlNote } from "react-icons/sl";
import { FaRegFolder } from "react-icons/fa";
import { TbSum } from "react-icons/tb";
import { IconType } from "react-icons";


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

