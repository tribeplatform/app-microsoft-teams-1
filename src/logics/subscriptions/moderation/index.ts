import { SubscriptionWebhook } from '@interfaces'
import { globalLogger } from '@utils'
import { getMember, getPost, getSpace } from '../helper'
import { getNetworkClient } from '@clients'
import { Types } from '@tribeplatform/gql-client'
import { EventVerb } from '@tribeplatform/gql-client/global-types'
import { ChannelRepository } from '@/repositories/channel.repository'
import { modration } from './logic.moderation'
const logger = globalLogger.setContext(`NetworkSubscription`)

export const handleModerationSubscription = async (
  webhook: SubscriptionWebhook<any>,
): Promise<void> => {
  const {
    networkId,
    data: { verb, object },
  } = webhook
  logger.debug('handleModerationSubscription called', { webhook })
  const gqlClient = await getNetworkClient(networkId)
  let post: null
  let member: null
  let channels: string[] = []

  if (object.entityType === Types.ModerationEntityType.POST) post = await getPost(gqlClient,object.entityId)
  else if (object.entityType === Types.ModerationEntityType.MEMBER) member = await getMember(gqlClient, object.createdById)

  const actor = await getMember(gqlClient, (object as Types.Post)?.createdById)
  const space = await getSpace(gqlClient, (object as Types.Post)?.spaceId)

  switch(verb){
    case EventVerb.CREATED:
        channels =  (
            await ChannelRepository.findMany({
              where: { networkId: networkId, spaceIds: object?.spaceId, modarationCreated: true },
            })
          ).map(channel => channel.channelId)
        await modration({object:post?post:member}, verb, space, channels)
        break
    case EventVerb.REJECTED:
        channels =  (
            await ChannelRepository.findMany({
              where: { networkId: networkId, spaceIds: object?.spaceId, modarationRejected: true },
            })
          ).map(channel => channel.channelId)
          await modration(actor, verb, space, channels)
        break
    case EventVerb.ACCEPTED:
        channels =  (
            await ChannelRepository.findMany({
              where: { networkId: networkId, spaceIds: object?.spaceId, modarationAccepted: true },
            })
          ).map(channel => channel.channelId)
          await modration(actor, verb, space, channels)
        break
    default:
    break
  }
}
