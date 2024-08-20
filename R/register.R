
renv::restore()

library(arrow)
library(dplyr)
library(tibble)
library(readr)
library(stringr)
library(tidyr)
library(glue)
library(digest)

library(RPostgreSQL)
library(DBI)


rename_lower <- function(df){

    df %>%
    setNames(str_to_lower(names(df))) %>%
    return

}


args <- commandArgs(trailingOnly = T)

# 環境変数から個別に接続パラメータを取得
con_str <- Sys.getenv("PG_DATABASE_URL")
# db_port <- Sys.getenv("DB_PORT")
# db_user <- Sys.getenv("DB_USER")
# db_password <- Sys.getenv("DB_PASSWORD")
# db_name <- Sys.getenv("DB_NAME")

root_dir <- "./resource"
# root_dir <- args[1]


# postgres:postgrespassword@postgres:5432/postgres

con <- dbConnect(RPostgres::Postgres(), con_str)

# con <- dbConnect(
#     RPostgres::Postgres(),
#     dbname = db_name,
#     host = db_host,
#     port = db_port,
#     user = db_user,
#     password = db_password
# )


# register
# 1. govlist
# 2. statlist


# init (order desc)
dbExecute(con, "DELETE FROM table_tag")
dbExecute(con, "DELETE FROM taglist")
dbExecute(con, "DELETE FROM tablelist")
dbExecute(con, "DELETE FROM statlist")
dbExecute(con, "DELETE FROM govlist")


# register
statlist.base <- read_csv(glue("{root_dir}/statlist.csv"), col_types = cols(.default = "c")) %>%
                  select(-`@id`)

## 1. govlist
statlist.base %>% distinct(govcode, govname) %>%
dbWriteTable(con, "govlist", ., append = TRUE, row.names = FALSE)

## 2. statlist
statlist.base %>% distinct(statcode, statname, govcode) %>%
dbWriteTable(con, "statlist", ., append = TRUE, row.names = FALSE)

## 3. tablelist
list.files(glue("{root_dir}/tables"), full.names = TRUE) %>%
purrr::map(function(path){
    statcode_ <- str_extract(path, "[0-9]{8}")

    base <- read_csv(path, col_types = cols(.default = "c")) %>%
    mutate(statcode = statcode_) %>%
    relocate(statcode) %>%
    rename_lower %>%
    return

}) %>% bind_rows() %>%
dbWriteTable(con, "tablelist", ., append = TRUE, row.names = FALSE)

## 4. taglist
list.files(glue("{root_dir}/tags"), full.names = TRUE) %>%
purrr::map(function(path){
    read_csv(path, col_types = cols(.default = "c")) %>%
    rename_lower %>%
    return
}) %>% bind_rows() %>%
distinct() %>%
dbWriteTable(con, "taglist", ., append = TRUE, row.names = FALSE)

## 5. table_tag
list.files(glue("{root_dir}/table_tag"), full.names = TRUE) %>%
purrr::map(function(path){
    read_csv(path, col_types = cols(.default = "c")) %>%
    rename_lower %>%
    return
}) %>% bind_rows() %>%
distinct() %>%
dbWriteTable(con, "table_tag", ., append = TRUE, row.names = FALSE)


dbDisconnect(con)

