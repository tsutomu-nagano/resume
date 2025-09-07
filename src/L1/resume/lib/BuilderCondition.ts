import { UniqueOperationNamesRule } from "graphql";


type Operator = "_eq" | "_gte" | "_lte";

function BuilderCondition_core(items: Map<string, Set<string>>, kind: string, table_name: string, column_name: string, operator: Operator = "_eq"): string {

    let condition: string = "";
    if (items.has(kind)) {
        const items_of_kind = items.get(kind)
        if (items_of_kind && items_of_kind.size >= 1) {
            const quotedItems = Array.from(items_of_kind).map(item => `${table_name}: { ${column_name}: {_eq: "${item}" } }`);
            condition = quotedItems.join(",")
        }
    }

    return (condition)

}

function BuilderTimeCondition(items: Map<string, Set<string>>, kind: string, table_name: string, column_name: string): string {

    let condition: string = "";
    if (items.has(kind)) {
        const items_of_kind = items.get(kind)
        if (items_of_kind && items_of_kind.size >= 1) {
            const quotedItems = Array.from(items_of_kind).map(
                item => {
                    const [from, to] = item.split("-"); // "-" で分割
                    
                    const parts: string[] = [];
                    if (from !== "") parts.push(`_gte: ${from}`);
                    if (to !== "") parts.push(`_lte: ${to}`);

                    if (parts.length === 0) {
                        return ""; // 両方 undefined の場合は条件なし
                    } else {
                        return `${table_name}: { ${column_name}: { ${parts.join(", ")} } }`;
                    }

                });
            condition = quotedItems.join(",")
        }
    }

    return (condition)

}


export function BuilderCondition(items: Map<string, Set<string>>): string[] {

    const statsCondition = BuilderCondition_core(items, "stat", "STATLIST", "STATNAME");
    const measuresCondition = BuilderCondition_core(items, "measure", "TABLE_MEASUREs", "NAME");
    const themasCondition = BuilderCondition_core(items, "thema", "TABLE_TAGs", "TAG_NAME");
    const dimensionsCondition = BuilderCondition_core(items, "dimension", "TABLE_DIMENSIONs", "CLASS_NAME");
    const regionsCondition = BuilderCondition_core(items, "region", "TABLE_REGIONs", "NAME");
    const timeCondition = BuilderTimeCondition(items, "time", "TABLE_TIMEs", "YEAR");

    const conditions = [
        statsCondition,
        measuresCondition,
        themasCondition,
        dimensionsCondition,
        regionsCondition,
        timeCondition
    ].filter(condition => condition !== ""); // null でないものをフィルタリング

    return (conditions)

    // return([statsCondition, measuresCondition, themasCondition].join(" "))

}


