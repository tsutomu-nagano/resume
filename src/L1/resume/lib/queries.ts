
import { gql, DocumentNode } from "@apollo/client";
import { BuilderCondition } from "./BuilderCondition";

export const GET_TABLE_LIST = (items: Map<string, Set<string>>): DocumentNode =>  {

    // const searchCondition: string = `_and: [ ${BuilderCondition(items).join(",")} ]`;
    const searchCondition: string = `${BuilderCondition(items).join(",")}`;

    console.log("searchCondition:", searchCondition);

    return(gql`
        query GetTableList($limit_number: Int, $offset_number: Int) {
            tablelist: TABLELIST(
                where:{${searchCondition}}
                limit: $limit_number
                offset: $offset_number
                order_by: { STATDISPID: asc }
            ) {
                statdispid: STATDISPID
                cycle: CYCLE
                statcode: STATCODE
                survey_date: SURVEY_DATE
                title: TITLE
                year_s: YEAR_S
                year_e: YEAR_E
                table_tags: TABLE_TAGs {
                    tag_name: TAG_NAME
                }
                table_measures: TABLE_MEASUREs {
                    name: NAME
                }
                table_dimensions: TABLE_DIMENSIONs {
                    class_name: CLASS_NAME
                }
                table_regions: TABLE_REGIONTYPEs {
                    regiontype: REGIONTYPE
                }
            }
        }
    `)

}

export const GET_TABLE_LIST_COUNT = (items: Map<string, Set<string>>): DocumentNode =>  {

    const searchCondition: string = `${BuilderCondition(items).join(",")}`;

    return(gql`
        query GetTableList($limit_number: Int, $offset_number: Int) {
            tablelist_aggregate: TABLELIST_aggregate(
                where:{${searchCondition}}
            ) {
                aggregate {
                    stat: count(distinct: true, column: STATCODE)
                    db: count(distinct: true, column: STATDISPID)
                }
            }
        }
    `)
}


export const GET_ITEMS = (resource_name: string, name: string): DocumentNode =>  {

    return(gql`
        query get_items {
        item: ${resource_name}(where: {CLASS_NAME: {_eq: "${name}"}}) {
            name: NAME
        }
        }
    `)
}





export const GET_SEARCH_TAG_LIST = (
    name: string, 
    field: string,
    ref_names: string[],
    searchTerm: string,
    items: Map<string, Set<string>>
    ): DocumentNode =>  {

    const searchCondition: string = `${BuilderCondition(items).join(",")}`;

    const ref_name_s = ref_names.join(":{")
    const ref_name_e = '}'.repeat(ref_names.length - 1);

    const test_query = `
        query GetMetaData {
            items: ${name}(where: {
                ${ref_name_s}: { ${searchCondition} } ${ref_name_e}
                ${field}: { _like: "%${searchTerm}%" }
                })
                {
                    name: ${field}
                }
            }
    `;

    console.log(test_query)
    return(gql`${test_query}`)

}
