const { Client } = require('pg');
const fs = require('fs');

const DATABASE_URL = "postgresql://postgres.szhzclwnughvyaqwssiy:malikErp3269@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

async function migrate() {
    const client = new Client({
        connectionString: DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("Connected to Supabase PostgreSQL.");

        // 1. Run schema
        const schema = fs.readFileSync('d:/Management/supabase_schema.sql', 'utf8');
        await client.query(schema);
        console.log("Schema executed successfully.");

        // 2. Load data
        const data = JSON.parse(fs.readFileSync('d:/Management/frontend/src/data/initialData.json', 'utf8'));

        // Insert company
        if (data.company) {
            await client.query(
                `INSERT INTO company (name, project, tagline, period) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
                [data.company.name, data.company.project, data.company.tagline, data.company.period]
            );
            console.log("Company data inserted.");
        }

        // Insert inventory and lots and transactions
        if (data.inventory) {
            for (const item of data.inventory) {
                await client.query(
                    `INSERT INTO inventory (id, sno, vendor, style, balance, unit, invoice_date, invoice_no, invoice_amount, status, sheet_name) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING`,
                    [item.id, item.sno, item.vendor, item.style, item.balance, item.unit, item.invoice_date, item.invoice_no, item.invoice_amount, item.status, item.sheet_name]
                );

                if (item.lots) {
                    for (const lot of item.lots) {
                        await client.query(
                            `INSERT INTO lots (lot_id, inventory_id, inward_date, inward_challan, received_qty, item_desc, status, invoice_no, invoice_date, invoice_amount)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (lot_id) DO NOTHING`,
                            [lot.lot_id, item.id, lot.inward_date, lot.inward_challan, lot.received_qty, lot.item_desc, lot.status, lot.invoice_no, lot.invoice_date, lot.invoice_amount]
                        );
                    }
                }

                if (item.transactions) {
                    for (const trx of item.transactions) {
                        await client.query(
                            `INSERT INTO transactions (inventory_id, date, challan_no, size_item, inward_qty, outward_qty, balance)
                             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                            [item.id, String(trx.date), trx.challan_no, String(trx.size_item), Number(trx.inward_qty) || 0, Number(trx.outward_qty) || 0, Number(trx.balance) || 0]
                        );
                    }
                }
            }
            console.log("Inventory data inserted.");
        }
        
        console.log("Migration complete!");
    } catch (e) {
        console.error("Error migrating:", e);
    } finally {
        await client.end();
    }
}

migrate();
