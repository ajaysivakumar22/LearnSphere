const { Client } = require('pg');

// Use locally defined fallback if env var missing (though it should be there in vercel/next)
// For local dev, process.env.DATABASE_URL might need dotenv
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        await client.query(`
      ALTER TABLE courses 
      ADD COLUMN IF NOT EXISTS scheduled_publish_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS assigned_instructor TEXT;
    `);

        console.log('Migration successful: Columns added.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
