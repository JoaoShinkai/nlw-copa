import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

// Biblioteca para a geração de unique ids
import ShortUniqueId from 'short-unique-id';

// Biblioteca para validação de schema vindo da requisição (Semelhante ao Joi)
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function poolRoutes(fastify: FastifyInstance){
    fastify.get('/pools/count', async () => {
        const count = await prisma.pool.count();

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

        try{
            await req.jwtVerify();

            await prisma.pool.create({
                data: {
                    title,
                    code,
                    ownerId: req.user.sub,

                    participants: {
                        create: {
                            userId: req.user.sub
                        }
                    }
                }
            })
        } catch{
            await prisma.pool.create({
                data: {
                    title,
                    code
                }
            })
        }

        

        return res.status(201).send({ code })
    })

    fastify.post('/pools/join', { onRequest: [authenticate] }, async (req, res) => {
        const joinPoolBody = z.object({
            code: z.string(),
        })

        // Pega o código do bolão que o usuário deseja participar
        const { code } = joinPoolBody.parse(req.body);

        // Verifica se o bolão existe
        const pool = await prisma.pool.findUnique({
            where: {
                code
            },
            include: {
                participants: {
                    where: {
                        userId: req.user.sub
                    }
                }
            }
        })

        // Caso não for encontrado nenhum bolão
        if(!pool){
            return res.status(400).send({
                message: 'Pool not found'
            })
        }

        // Caso o usuário já pertença a esse bolão
        if(pool.participants.length > 0){
            return res.status(400).send({
                message: 'User already joined this pool'
            })
        }

        // Caso o bolão não possua dono, o primeiro participante vira dono do bolão
        if(!pool.ownerId){
            await prisma.pool.update({
                where: {
                    id: pool.id
                },
                data: {
                    ownerId: req.user.sub
                }
            })
        }

        // Criação do bolão
        await prisma.participant.create({
            data: {
                poolId: pool.id,
                userId: req.user.sub
            }
        })

        return res.status(201).send();
    })

    fastify.get('/pools', { onRequest: [authenticate] }, async(req, res) => {
        const pools = await prisma.pool.findMany({
            where: {
                participants: {
                    some: {
                        userId: req.user.sub,
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        participants: true,
                    }
                },
                participants: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                avatarUrl: true
                            }
                        }
                    },
                    take: 4
                },
                owner: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return { pools }
    })

    fastify.get('/pools/:id', {onRequest: [authenticate]}, async(req, res) => {
        const getPoolParams = z.object({
            id: z.string()
        })

        const { id } = getPoolParams.parse(req.params);

        const pool = await prisma.pool.findUnique({
            where: {
                id
            },
            include: {
                _count: {
                    select: {
                        participants: true,
                    }
                },
                participants: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                avatarUrl: true
                            }
                        }
                    },
                    take: 4
                },
                owner: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return { pool }

    })

}
