
function BuilderCondition_core(items: Map<string, Set<string>>, kind: string, table_name: string, column_name: string): string {

    let condition: string = "";
    if (items.has(kind)){
        const items_of_kind = items.get(kind)
        if (items_of_kind && items_of_kind.size >= 1){
            const quotedItems = Array.from(items_of_kind).map(item => `${table_name}: { ${column_name}: {_eq: "${item}" } }`);
            condition = quotedItems.join(",")
        }
    }

    return(condition)

}


export function BuilderCondition(items: Map<string, Set<string>>): string[] {

    const statsCondition = BuilderCondition_core(items, "stat", "STATLIST", "STATNAME");
    const measuresCondition = BuilderCondition_core(items, "measure", "TABLE_MEASUREs", "NAME");
    const themasCondition = BuilderCondition_core(items, "thema", "TABLE_TAGs", "TAG_NAME");
    const dimensionsCondition = BuilderCondition_core(items, "dimension", "TABLE_DIMENSIONs", "CLASS_NAME");
    const regionsCondition = BuilderCondition_core(items, "region", "TABLE_REGIONs", "CLASS_NAME");

    const conditions = [
        statsCondition,
        measuresCondition,
        themasCondition,
        dimensionsCondition,
        regionsCondition
      ].filter(condition => condition !== ""); // null でないものをフィルタリング

    return(conditions)

    // return([statsCondition, measuresCondition, themasCondition].join(" "))

}


