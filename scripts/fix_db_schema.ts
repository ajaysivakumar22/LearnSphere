
import { query, pool } from '../src/db';

async function migrate() {
    console.log('Starting DB Migration for Progress Tracking...');

    try {
        // 1. Create lesson_progress table if not exists
        await query(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        is_completed BOOLEAN NOT NULL DEFAULT false,
        completed_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, lesson_id)
      );
    `);
        console.log('✅ Table `lesson_progress` created or already exists.');

        // 2. Create index for performance
        await query(`
      CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_course 
      ON lesson_progress(user_id, lesson_id);
    `);
        console.log('✅ Indexes created.');

    } catch (e) {
        console.error('❌ Migration failed:', e);
    } finally {
        await pool.end();
    }
}

migrate();
