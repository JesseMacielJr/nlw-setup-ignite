import { PrismaClient } from '@prisma/client';

// Faz a conexão com o banco de dados
const prisma = new PrismaClient();

async function main() {
  // Deleta todos os dados
  await prisma.habit.deleteMany();

  await prisma.habit.create({
    data: {
      title: 'Beber 2L de água',
      created_at: new Date('2023-01-17T00:00:00.000z')
    }
  })
}

// Chama a função main que irá executar os scripts do banco. 
main()
  .then(async () => {
    // Depois que terminamos de usar então desconectamos do banco de dados
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
