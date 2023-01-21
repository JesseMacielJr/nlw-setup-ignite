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

  // Busca no dia os hábitos possíveis e também os hábitos completados
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

  // Mesmo que adicionamos coisas durante o patch ele é semanticamente correto nesse caso
  app.patch('/habits/:id/toggle', async (request) => {
    // route param: parâmetro de identificação

    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });
    const { id } = toggleHabitParams.parse(request.params);

    const today = dayjs().startOf('day').toDate();

    // Busca o dia de hoje no BD
    let day = await prisma.day.findUnique({
      where: {
        date: today,
      },
    });
    // Cria o dia no BD caso o mesmo não tenha sido criado (ainda não teve nenhum hábito completado)
    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        },
      });
    }
    // Buscamos se o usuário já tinha marcado esse hábito como completo nesse dia
    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        },
      },
    });
    if (dayHabit) {
      // Remover a marcação de completo
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      });
    } else {
      // Completar o hábito nesse dia
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        },
      });
    }
  });

  // Retornar um resumo contendo uma array de objetos, em que cada objeto contém informações
  // tais como (data, quant. de hábitos possíveis, quant. de hábitos completados)
  app.get('/summary', async () => {
    const summary = await prisma.$queryRaw`
      SELECT 
        D.id, 
        D.date,
        (
          SELECT 
            cast(count(*) as float)
          FROM day_habits DH
          WHERE DH.day_id = D.id
        ) as completed,
        (
          SELECT
            cast(count(*) as float)
            FROM habit_week_days HWD
            JOIN habits H
              ON H.id = HWD.habit_id
            WHERE 
              HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
              AND H.created_at <= D.date
        ) as amount
      FROM days D
    `;

    return summary;
  });
}
