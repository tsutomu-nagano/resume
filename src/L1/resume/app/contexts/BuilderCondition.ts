
function BuilderCondition_core(items: Map<string, Set<string>>, kind: string, table_name: string, column_name: string): string {

    let condition: string = "";
    if (items.has(kind)){
        const items_of_kind = items.get(kind)
        if (items_of_kind && items_of_kind.size >= 1){
            const quotedItems = Array.from(items_of_kind).map(item => `"${item}"`);
            condition = `${table_name}: { ${column_name}: { _in: [${quotedItems.join(",")}] } } `
        }
    }

    return(condition)

}


export function BuilderCondition(items: Map<string, Set<string>>): string {

    const statsCondition = BuilderCondition_core(items, "stat", "statlist", "statname");
    const measuresCondition = BuilderCondition_core(items, "measure", "table_measures", "name");
    const themasCondition = BuilderCondition_core(items, "thema", "table_tags", "tag_name");
    const dimensionsCondition = BuilderCondition_core(items, "dimension", "table_dimensions", "class_name");

    return([statsCondition, measuresCondition, themasCondition, dimensionsCondition].join(" "))

    // return([statsCondition, measuresCondition, themasCondition].join(" "))

}


