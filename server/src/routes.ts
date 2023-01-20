import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from './lib/prisma';
import dayjs from 'dayjs';

export async function appRoutes(app: FastifyInstance) {
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
  // app.get('/hello', async () => {
  //   // Retorna todos os hábitos do BD
  //   // const habits = await prisma.habit.findMany();

  //   // Retorna informações específicas
  //   const habits = await prisma.habit.findMany({
  //     where: {
  //       title: {
  //         startsWith: 'Beber'
  //       }
  //     }
  //   });
  //   return habits;
  // });
  app.post('/habits', async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    // Se o zod invalidar algum dado então nem continua a execução das próximas linhas
    const { title, weekDays } = createHabitBody.parse(request.body);

    // Irá zerar as horas, minutos e segundos
    const today = dayjs().startOf('day').toDate();

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map((weekDay) => {
            return {
              week_day: weekDay,
            };
          }),
        },
      },
    });
  });

  app.get('/day', async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date(), // Converte o parâmetro que eu receber em uma data
    });

    const { date } = getDayParams.parse(request.query);
    // Tentativa de arrumar o time stamp que ocorreu (será corrigido no front-end)
    const parsedDate = dayjs(date).startOf('day');
    // day: dia da semana | date: dia do mês
    const weekDay = dayjs(parsedDate).get('day');

    // Buscar todos os hábitos possíveis
    const possibleHabits = await prisma.habit.findMany({
      // O prisma é possível fazer where encadeados em relacionamento. Cria o join automaticamente
      where: {
        created_at: {
          // regra de negócio que faz com que aparecam apenas hábitos criados antes que o dia de busca
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    });

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      },
    });

    // O operador "?." é chamado de operador de acesso seguro ou operador de navegação segura.
    // Permite acessar um valor aninhado em um objeto sem gerar um erro se algum valor no caminho for nulo ou indefinido.
    // Se for nulo ou indefinido, o valor retornado será undefined.
    const completedHabits = day?.dayHabits.map((dayHabit) => {
      return dayHabit.habit_id;
    });

    return {
      possibleHabits,
      completedHabits,
    };
  });
}
