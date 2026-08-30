import { defineConfig } from '@prisma/config';

// Migration / CLI commands (e.g. npx prisma migrate deploy) use DIRECT_URL (direct PostgreSQL connection).
// Falls back to DATABASE_URL if DIRECT_URL is not set.
const migrationUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: migrationUrl,
  },
});
