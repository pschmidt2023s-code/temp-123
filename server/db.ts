import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

// Provide a fallback for development if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/glassbeats';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  WARNING: DATABASE_URL is not set. Using fallback. Data will not persist!');
  console.warn('⚠️  Set DATABASE_URL in your environment variables or .env file');
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
