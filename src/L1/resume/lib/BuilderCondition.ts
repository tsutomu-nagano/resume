
function BuilderCondition_core(items: Map<string, Set<string>>, kind: string, table_name: string, column_name: string, operator: string): string {

    let condition: string = "";
    const kind_operator = `${kind}:${operator}`;
    if (items.has(kind_operator)){
        const items_of_kind = items.get(kind_operator)
        if (items_of_kind && items_of_kind.size >= 1){
            const op = operator === "_eq" ? "_eq" : "_neq";
            const quotedItems = Array.from(items_of_kind).map(item => `${table_name}: { ${column_name}: {${op}: "${item}" } }`);
            condition = quotedItems.join(",")
        }
    }

    return(condition)

}


export function BuilderCondition(items: Map<string, Set<string>>): string[] {

    const statsCondition_eq = BuilderCondition_core(items, "stat", "STATLIST", "STATNAME", "_eq");
    const measuresCondition_eq = BuilderCondition_core(items, "measure", "TABLE_MEASUREs", "NAME", "_eq");
    const themasCondition_eq = BuilderCondition_core(items, "thema", "TABLE_TAGs", "TAG_NAME", "_eq");
    const dimensionsCondition_eq = BuilderCondition_core(items, "dimension", "TABLE_DIMENSIONs", "CLASS_NAME", "_eq");
    const regionsCondition_eq = BuilderCondition_core(items, "region", "TABLE_REGIONs", "CLASS_NAME", "_eq");

    const statsCondition_neq = BuilderCondition_core(items, "stat", "STATLIST", "STATNAME", "_neq");
    const measuresCondition_neq = BuilderCondition_core(items, "measure", "TABLE_MEASUREs", "NAME", "_neq");
    const themasCondition_neq = BuilderCondition_core(items, "thema", "TABLE_TAGs", "TAG_NAME", "_neq");
    const dimensionsCondition_neq = BuilderCondition_core(items, "dimension", "TABLE_DIMENSIONs", "CLASS_NAME", "_neq");
    const regionsCondition_neq = BuilderCondition_core(items, "region", "TABLE_REGIONs", "CLASS_NAME", "_neq");

    const conditions = [
        statsCondition_eq,
        measuresCondition_eq,
        themasCondition_eq,
        dimensionsCondition_eq,
        regionsCondition_eq,
        statsCondition_neq,
        measuresCondition_neq,
        themasCondition_neq,
        dimensionsCondition_neq,
        regionsCondition_neq
      ].filter(condition => condition !== ""); // null でないものをフィルタリング

    return(conditions)

}


