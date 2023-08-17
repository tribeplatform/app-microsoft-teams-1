import { Channel, Prisma, PrismaClient } from '@prisma/client'

const client = new PrismaClient()

export const ChannelRepository = {
  create: (data: Prisma.ChannelCreateArgs['data']): Promise<Channel> => {
    return client.channel.create({ data })
  },
  update: (
    id: string,
    data: Prisma.ChannelUpdateArgs['data'],
  ): Promise<Channel> => {
    return client.channel.update({ where: { id }, data })
  },
  upsert: (
    id: string,
    data: Omit<Prisma.ChannelCreateArgs['data'], 'networkId'>,
  ): Promise<Channel> => {
    return client.channel.upsert({
      create: { id, ...data },
      update: data,
      where: { id },
    })
  },
  delete: (id: string): Promise<Channel> => {
    return client.channel.delete({ where: { id } })
  },
  findMany: (args?: Prisma.ChannelFindManyArgs): Promise<Channel[]> => {
    return client.channel.findMany(args)
  },
  findUniqueOrThrow: (id: string): Promise<Channel> => {
    return client.channel.findUniqueOrThrow({ where: { id } })
  },
  findUnique: (id: string): Promise<Channel> => {
    return client.channel.findUnique({ where: { id } })
  },




  
}
