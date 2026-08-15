const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres.szhzclwnughvyaqwssiy:malikErp3269@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

async function addUsers() {
    const client = new Client({
        connectionString: DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("Connected to Supabase PostgreSQL.");

        const schema = `
        CREATE TABLE IF NOT EXISTS app_users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        );

        ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all actions for anon on app_users" ON app_users FOR ALL USING (true);
        
        INSERT INTO app_users (username, password, role) VALUES ('admin', 'admin123', 'Admin') ON CONFLICT (username) DO NOTHING;
        INSERT INTO app_users (username, password, role) VALUES ('dkpt', 'dkpt123', 'Manager') ON CONFLICT (username) DO NOTHING;
        `;
        
        await client.query(schema);
        console.log("app_users table created and seeded successfully.");

    } catch (e) {
        console.error("Error setting up users:", e);
    } finally {
        await client.end();
    }
}

addUsers();
