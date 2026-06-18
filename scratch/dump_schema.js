const pool = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function dumpSchema() {
    try {
        // Query columns and types
        const colRes = await pool.query(`
            SELECT table_name, column_name, data_type, is_nullable, column_default, character_maximum_length
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position
        `);

        // Query foreign keys and constraints
        const fkRes = await pool.query(`
            SELECT
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                tc.constraint_type
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.table_schema='public'
        `);

        const schema = {};
        
        for (const row of colRes.rows) {
            if (!schema[row.table_name]) {
                schema[row.table_name] = {
                    columns: [],
                    constraints: []
                };
            }
            schema[row.table_name].columns.push({
                name: row.column_name,
                type: row.data_type,
                nullable: row.is_nullable,
                default_val: row.column_default,
                max_len: row.character_maximum_length
            });
        }

        for (const row of fkRes.rows) {
            if (schema[row.table_name]) {
                schema[row.table_name].constraints.push({
                    column: row.column_name,
                    ref_table: row.foreign_table_name,
                    ref_column: row.foreign_column_name,
                    type: row.constraint_type
                });
            }
        }

        fs.writeFileSync(path.join(__dirname, 'schema_dump.json'), JSON.stringify(schema, null, 2));
        console.log('Schema successfully dumped to scratch/schema_dump.json');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

dumpSchema();
