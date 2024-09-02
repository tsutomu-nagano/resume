

library(httr)
library(readr)
library(dplyr)
library(arrow)
library(glue)
library(tidyr)
library(stringr)
library(digest)



toArray <- function(obj){

    if (!is.null(names(obj))){
        return(list(obj))
    } else {
        return(obj)
    }

}


getMetaList <- function(appid, statsdataid){

    print(statsdataid)


    url <- glue("http://api.e-stat.go.jp/rest/3.0/app/json/getMetaInfo?appId={appid}&statsDataId={statsdataid}&explanationGetFlg=Y")
    res <- GET(url)
    res.json <- content(res)

    class_objs <- res.json$GET_META_INFO$METADATA_INF$CLASS_INF$CLASS_OBJ %>% toArray

    base <- class_objs %>%
    purrr::map(function(class_obj){


        class.id <- class_obj$`@id`
        class.name <- class_obj$`@name`

        classes <- class_obj$CLASS %>% toArray

        classes %>%
        tibble %>%
        unnest_wider(".") %>%
        rename_with(~ str_replace(.x, "@",""), everything()) %>%
        mutate(across(everything(), ~replace_na(.x, ""))) %>%
        mutate(class.type = str_replace(class.id, "(.+?)[0-9]+$", "\\1")) %>%
        mutate(class.name = class.name) %>%
        return

    }) %>% bind_rows %>%
    select(-one_of("level", "parentCode")) %>%
    mutate(STATDISPID = statsdataid) %>%
    return

}

getStatsList <- function(appid, statcode){

    base <- ""
    next_key <- "1"
    while (!is.null(next_key)){

        url <- glue("http://api.e-stat.go.jp/rest/3.0/app/json/getStatsList?appId={appid}&statsCode={statcode}&startPosition={next_key}")
        res <- GET(url)
        res.json <- content(res)

        datalist_inf <- res.json$GET_STATS_LIST$DATALIST_INF
        result_inf <- datalist_inf$RESULT_INF
        table_infs <- datalist_inf$TABLE_INF %>% toArray

        if (any(names(result_inf) == "NEXT_KEY")){
            next_key <- result_inf$NEXT_KEY
        } else {
            next_key <- NULL        
        }

        base_ <- table_infs %>%
                tibble %>%
                unnest_wider(".") %>%
                rename(STATDISPID = `@id`) %>%
                select(STATDISPID, STAT_NAME, TITLE, STATISTICS_NAME_SPEC, CYCLE, SURVEY_DATE) %>%
                unnest_wider(c("STAT_NAME","STATISTICS_NAME_SPEC","TITLE"), names_sep = ".") %>%
                rename_with( ~ "TITLE", matches("TITLE\\.[1$]")) %>%
                select(-matches("TITLE\\.")) %>%
                rename(STAT_CODE = `STAT_NAME.@code`, STAT_NAME = `STAT_NAME.$`)


        if (base == ""){
            base <- base_
        } else {
            base <- bind_rows(base, base_)
        }

    }


    # TODO tagとなる情報のうち意味をわけるものがあればここで整理する


    # 提供統計名等をtagとして整理
    # 統計調査名と同一のものは除外
    tags.base <- base %>%
                select(STATDISPID, STAT_NAME, starts_with("STATISTICS_NAME_SPEC")) %>%
                pivot_longer(-c("STATDISPID","STAT_NAME")) %>%
                filter(!is.na(value)) %>%
                filter(STAT_NAME != value) %>%
                select(STATDISPID, value) %>%
                rename(TAG_NAME = value)

    print(tags.base)

    tags <- tags.base %>%
                distinct(TAG_NAME)


    # tags.base <- tags.base %>%
    #                 left_join(tags, by = "value", multiple = "all") %>%
    #                 select(-value)


    # 統計表基本情報の整理
    tables <- base %>%
             select(STATDISPID, TITLE, CYCLE, SURVEY_DATE)


    ret <- list(
            tables = tables,
            tags = tags,
            table_tag = tags.base
            # table_tag = 
    )

    return(ret)


}


meta_output <- function(statcode, src, name, type, selection){

    dest.dir <- glue("{root_dir}/{name}")
    if (!dir.exists(dest.dir)){
        dir.create(dest.dir)
    }
    dest <-  glue("{dest.dir}/{statcode}_{name}.csv")
    list.files(src, full.names = TRUE) %>%
    purrr::map(function(path){
        read_parquet(path) %>%
        filter(class.type == type) %>%
        select(one_of(selection)) %>%
        distinct %>%
        return
    }) %>% bind_rows %>%
    distinct %>%
    write_excel_csv(dest, quote = "all")

}

args <- commandArgs(trailingOnly = T)

appid <- Sys.getenv("APPID")
root_dir <- args[1]


# 統計一覧の内容でループ
statlist <- read_csv(glue("{root_dir}/statlist.csv"), col_types = cols(.default = "c"))

# dbへの登録用のデータ作成
statlist %>%
pull(statcode) %>%
purrr::map(function(statcode){

    # テーブルの一覧　タグの一覧　出力
    ret <- getStatsList(appid, statcode)
    names(ret) %>%
    purrr::map(function(name){

        dest.dir <- glue("{root_dir}/{name}")
        if (!dir.exists(dest.dir)){
            dir.create(dest.dir)
        }
        dest <- glue("{dest.dir}/{statcode}_{name}.csv")
        ret[[name]] %>% write_excel_csv(dest, quote = "all")

    })


    # メタの一覧出力
    # 一旦すべてtempエリアへ出力
    src <- glue("{root_dir}/tables/{statcode}_tables.csv")
    src.latest <- glue("{root_dir}/tables/{statcode}_tables_latest.csv")

    tables <- read_csv(src, col_types = cols(.default = "c"))

    if (file.exists(src.latest)){
        tables.latest <- read_csv(src.latest, col_types = cols(.default = "c"))

        ids.latest <- tables.latest %>%
                        distinct(STATDISPID) %>%
                        mutate(islatest = TRUE)
        
        ids.new <- tables %>%
                        distinct(STATDISPID) %>%
                        mutate(isnew = TRUE)

        ids.all <- ids.latest %>% full_join(ids.new, by = "STATDISPID")

        ids.update <- ids.all %>% filter(is.na(islatest)) %>% pull(STATDISPID)
        ids.remove <- ids.all %>% filter(is.na(isnew)) %>% pull(STATDISPID)

    } else {

        ids.update <- tables %>% pull(STATDISPID)
        ids.remove <- c()

    }


    base.dir <- glue("{root_dir}/temp/{statcode}/base")
    if (!dir.exists(base.dir)){
        dir.create(base.dir, recursive = TRUE)
    }




    # 新規or更新のため取得
    ids.update %>%
    purrr::map(function(statdispid){
        
        dest <- glue("{base.dir}/{statdispid}.parquet")
        getMetaList(appid, statdispid) %>%
        write_parquet(dest)

    })


    # 削除
    ids.remove %>%
    purrr::map(function(statdispid){
        
        dest <- glue("{base.dir}/{statdispid}.parquet")
        file.remove(dest)

    })


    tables %>%
    write_excel_csv(src.latest, quote = "all")

    file.remove(src)


    # 変更があった時のみ再作成
    if (length(ids.update) >= 1 | length(ids.remove) >= 1){

        # 事項名とテーブルのIDの中間テーブル用データ作成
        meta_output(statcode, base.dir, "table_dimension", "cat", c("STATDISPID", "class.name"))
        meta_output(statcode, base.dir, "dimension_item", "cat", c("class.name", "name"))

        # 集計事項とテーブルのIDの中間テーブル用データ作成
        meta_output(statcode, base.dir, "table_measure", "tab", c("STATDISPID", "name"))

        # TODO 時間軸とテーブルのIDの中間テーブル用データ作成
        # TODO 地域とテーブルのIDの中間テーブル用データ作成

    }



})

