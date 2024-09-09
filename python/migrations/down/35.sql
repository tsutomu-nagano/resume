
    DECLARE
        
        table_count NUMBER;
        constraint_count NUMBER;
    
    BEGIN
        
        -- テーブルの存在を確認
        SELECT COUNT(*)
        INTO table_count
        FROM user_tables
        WHERE table_name = 'TABLE_DIMENSION';

        -- 制約の存在を確認
        SELECT COUNT(*)
        INTO constraint_count
        FROM all_constraints
        WHERE constraint_name = 'TABLE_DIMENSION_STATDISPID_FKEY'
        AND table_name = 'TABLE_DIMENSION';
    

        -- 
        -- テーブルが存在して制約が存在する場合のみ実行
    
        
        IF table_count = 1 AND constraint_count = 1 THEN
    
            EXECUTE IMMEDIATE '
            ALTER TABLE table_dimension DROP CONSTRAINT table_dimension_statdispid_fkey
            ';
        END IF;
        
    END;
    