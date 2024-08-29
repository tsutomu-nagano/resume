
import { gql, DocumentNode } from "@apollo/client";
import { BuilderCondition } from "./BuilderCondition";

export const GET_TABLE_LIST = (items: Map<string, Set<string>>): DocumentNode =>  {

    const searchCondition: string = BuilderCondition(items);

    return(gql`
        query GetTableList($limit_number: Int, $offset_number: Int) {
        tablelist(
            where:{${searchCondition}}
            limit: $limit_number
            offset: $offset_number
            order_by: { statdispid: asc }
        ) {
            statdispid
            cycle
            statcode
            survey_date
            title
            table_tags {
            tag_name
            }
            table_measures {
            name
            }
            table_dimensions {
            class_name
            }
        }
        }
    `)
}

export const GET_TABLE_LIST_COUNT = (items: Map<string, Set<string>>): DocumentNode =>  {

    const searchCondition: string = BuilderCondition(items);

    return(gql`
        query GetTableList($limit_number: Int, $offset_number: Int) {
            tablelist_aggregate(
                where:{${searchCondition}}
            ) {
                aggregate {
                    stat: count(distinct: true, columns: [statcode])
                    db: count(distinct: true, columns: [statdispid])
                }
            }
        }
    `)
}


export const GET_DIMENSION_ITEMS = (dimension_name: string): DocumentNode =>  {

    return(gql`
        query get_dimension_items {
        dimension_item(where: {class_name: {_eq: "${dimension_name}"}}) {
            name
        }
        }
    `)
}
