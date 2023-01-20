import Fastify from 'fastify';
import cors from '@fastify/cors';
import { appRoutes } from './routes';

// Cria a aplicação executando o Fastify
const app = Fastify();

// Integra o CORs para habilitar que o front consuma os dados
app.register(cors, {
  // Permite que apenas o seguinte endereço acesso os dados
  origin: 'http://localhost.3000',
});

app.register(appRoutes);

// Faz com que a nossa aplicação ouça a porta 3333
app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP Server running');
  });
