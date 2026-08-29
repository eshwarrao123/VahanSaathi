import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

  // If using PostgreSQL (production DB environment)
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    return new PrismaClient();
  }

  // SQLite adapter for local development
  let dbPath = dbUrl.replace(/^file:/, '');
  if (!path.isAbsolute(dbPath)) {
    dbPath = path.join(/*turbopackIgnore: true*/ process.cwd(), dbPath);
  }

  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
