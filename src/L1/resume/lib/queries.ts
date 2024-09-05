
import { gql, DocumentNode } from "@apollo/client";
import { BuilderCondition } from "./BuilderCondition";

export const GET_TABLE_LIST = (items: Map<string, Set<string>>): DocumentNode =>  {

    const searchCondition: string = BuilderCondition(items);

    // return(gql`
    //     query GetTableList($limit_number: Int, $offset_number: Int) {
    //     tablelist(
    //         where:{${searchCondition}}
    //         limit: $limit_number
    //         offset: $offset_number
    //         order_by: { statdispid: asc }
    //     ) {
    //         statdispid
    //         cycle
    //         statcode
    //         survey_date
    //         title
    //         table_tags {
    //         tag_name
    //         }
    //         table_measures {
    //         name
    //         }
    //         table_dimensions {
    //         class_name
    //         }
    //     }
    //     }
    // `)

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
                table_tags: TABLE_TAGs {
                    tag_name: TAG_NAME
                }
                table_measures: TABLE_MEASUREs {
                    name: NAME
                }
                table_dimensions: TABLE_DIMENSIONs {
                    class_name: CLASS_NAME
                }
            }
        }
    `)

}

export const GET_TABLE_LIST_COUNT = (items: Map<string, Set<string>>): DocumentNode =>  {

    const searchCondition: string = BuilderCondition(items);

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


export const GET_DIMENSION_ITEMS = (dimension_name: string): DocumentNode =>  {

    return(gql`
        query get_dimension_items {
        dimension_item: DIMESION_ITEM(where: {CLASS_NAME: {_eq: "${dimension_name}"}}) {
            name: NAME
        }
        }
    `)
}
