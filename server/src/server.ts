import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import cors from '@fastify/cors';

// Cria a aplicação executando o Fastify
const app = Fastify();

// Com isso a conexão com o BD ja está feita
const prisma = new PrismaClient();

// Integra o CORs para habilitar que o front consuma os dados
app.register(cors, {
  // Permite que apenas o seguinte endereço acesso os dados
  origin: 'http://localhost.3000'
});

/*
Métodos HTTP:
  GET: busca alguma informação, como listas ou dados de um BD. (Navegador só faz GET)
  POST: cria algum recurso.
  PUT: atualiza algum recurso por completo.
  PATCH: atualiza uma informação específica de algum recurso
  DELETE: deleta um recurso.
*/

// Cria a rota usando uma das opções acima
// Como o acesso ao BD retorna uma promise então usamos async e await
app.get('/hello', async () => {
  // Retorna todos os hábitos do BD
  // const habits = await prisma.habit.findMany();

  // Retorna informações específicas
  const habits = await prisma.habit.findMany({
    where: {
      title: {
        startsWith: 'Beber'
      }
    }
  });

  return habits;
});

// Faz com que a nossa aplicação ouça a porta 3333
app.listen({
  port: 3333,
}).then(() => {
  console.log('HTTP Server running');
});