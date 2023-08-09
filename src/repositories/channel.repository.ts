import { Channel, Prisma, PrismaClient } from '@prisma/client'

const client = new PrismaClient()

export const ChannelRepository = {
  create: (data: Prisma.ChannelCreateArgs['data']): Promise<Channel> => {
    return client.channel.create({ data })
  },
  update: (
    networkId: string,
    data: Prisma.ChannelUpdateArgs['data'],
  ): Promise<Channel> => {
    return client.channel.update({ where: { networkId }, data })
  },
  upsert: (
    networkId: string,
    data: Omit<Prisma.ChannelCreateArgs['data'], 'networkId'>,
  ): Promise<Channel> => {
    return client.channel.upsert({
      create: { networkId, ...data },
      update: data,
      where: { networkId },
    })
  },
  delete: (networkId: string): Promise<Channel> => {
    return client.channel.delete({ where: { networkId } })
  },
  findMany: (args?: Prisma.ChannelFindManyArgs): Promise<Channel[]> => {
    return client.channel.findMany(args)
  },
  findUniqueOrThrow: (networkId: string): Promise<Channel> => {
    return client.channel.findUniqueOrThrow({ where: { networkId } })
  },
  findUnique: (networkId: string): Promise<Channel> => {
    return client.channel.findUnique({ where: { networkId } })
  },




  
}
