
    DECLARE
        
        table_count NUMBER;
        constraint_count NUMBER;
    
    BEGIN
        
        -- テーブルの存在を確認
        SELECT COUNT(*)
        INTO table_count
        FROM user_tables
        WHERE table_name = 'TABLE_TAG';

        -- 制約の存在を確認
        SELECT COUNT(*)
        INTO constraint_count
        FROM all_constraints
        WHERE constraint_name = 'TABLE_TAG_TAG_NAME_FKEY'
        AND table_name = 'TABLE_TAG';
    

        -- 
        -- テーブルが存在して制約が存在しない場合のみ実行
    
        
        IF table_count = 1 AND constraint_count = 0 THEN
    
            EXECUTE IMMEDIATE '
            ALTER TABLE table_tag
                ADD CONSTRAINT table_tag_tag_name_fkey FOREIGN KEY (tag_name) REFERENCES taglist(tag_name) 
            
            ';
        END IF;
        
    END;
    