
    DECLARE
        
        table_count NUMBER;
    
    BEGIN
        
        -- テーブルの存在を確認
        SELECT COUNT(*)
        INTO table_count
        FROM user_tables
        WHERE table_name = 'DIMENSIONLIST';
    

        -- 
        -- テーブルが存在する場合のみ実行
    
        
        IF table_count = 1 THEN
    
            EXECUTE IMMEDIATE '
            DROP TABLE dimensionlist
            ';
        END IF;
        
    END;
    