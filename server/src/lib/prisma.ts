import { PrismaClient } from '@prisma/client';

// Com isso a conexão com o BD ja está feita
export const prisma = new PrismaClient({
  // Mostra a query em SQL
  log: ['query']
});
