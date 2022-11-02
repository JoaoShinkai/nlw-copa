import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import Fastify from 'fastify';

// Biblioteca para a geração de unique ids
import ShortUniqueId from 'short-unique-id';

// Biblioteca para validação de schema vindo da requisição (Semelhante ao Joi)
import { z } from 'zod';

const prisma = new PrismaClient({
    log: ['query']
})

async function bootstrap(){
    const fastify = Fastify({
        logger: true,
    })

    await fastify.register(cors, {
        origin: true
    })

    fastify.get('/pools/count', async () => {
        const count = await prisma.pool.count();

        return { count }
    })

    fastify.get('/users/count', async () => {
        const count = await prisma.user.count();

        return { count }
    })

    fastify.get('/guesses/count', async () => {
        const count = await prisma.guess.count();

        return { count }
    })

    fastify.post('/pools', async (req, res) => {
        // Criação do schema
        const createPoolBody = z.object({
            title: z.string(),
        })

        const { title } = createPoolBody.parse(req.body);

        // Generate unique id
        const generate = new ShortUniqueId({ length: 6 });
        const code = String(generate()).toUpperCase();

        await prisma.pool.create({
            data: {
                title,
                code
            }
        })

        return res.status(201).send({ code })
    })

    await fastify.listen({port: 3333, host: '0.0.0.0'});
}

bootstrap();