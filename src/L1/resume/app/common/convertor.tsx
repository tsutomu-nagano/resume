import { BsTag } from "react-icons/bs";
import { SlNote } from "react-icons/sl";
import { FaRegFolder } from "react-icons/fa";
import { TbSum } from "react-icons/tb";
import { TbMapPin } from "react-icons/tb";
import { LuDatabase } from "react-icons/lu";
import { RiTimeLine } from "react-icons/ri";

const iconMap: Record<string, JSX.Element> = {
    stat: <SlNote />,
    measure: <TbSum />,
    dimension: <BsTag />,
    thema: <FaRegFolder />,
    region: <TbMapPin />,
    db: <LuDatabase />,
    time: <RiTimeLine />
};

export const renderIconByKind = (kind: string) => {
    return iconMap[kind] || <BsTag />;
};



export function descriptionByKind(kind: string): string {

    switch (kind) {
        case 'stat':
            return "統計調査"
        case 'measure':
            return "統計データにおける量的変数";
        case 'dimension':
            return "統計データにおける質的変数";
        case 'region':
            return "統計データにおける地理的変数";
        case 'thema':
            return "統計作成機関で設定しているカテゴリ";
        case 'time':
            return "統計データの時点";
        default:
            return "その他";
    }

}


export function kind_en2ja(kind: string): string {

    switch (kind) {
        case 'stat':
            return "統計調査"
        case 'measure':
            return "集計事項";
        case 'dimension':
            return "分類事項";
        case 'region':
            return "地域事項";
        case 'thema':
            return "提供分類等";
        case 'time':
            return "時間軸事項";
        default:
            return "その他";
    }

}

