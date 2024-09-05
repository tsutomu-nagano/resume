
    DECLARE
        
        table_count NUMBER;
    
    BEGIN
        
        -- テーブルの存在を確認
        SELECT COUNT(*)
        INTO table_count
        FROM user_tables
        WHERE table_name = 'STATLIST';
    

        -- 
        -- テーブルが存在する場合のみ実行
    
        
        IF table_count = 1 THEN
    
            EXECUTE IMMEDIATE '
            DROP TABLE statlist
            ';
        END IF;
        
    END;
    