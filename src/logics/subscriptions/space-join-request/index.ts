import { SubscriptionWebhook } from '@interfaces'
import { EventVerb } from '@tribeplatform/gql-client/global-types'
import { Member } from '@tribeplatform/gql-client/types'
import { globalLogger } from '@utils'
import { getMember, getSpace } from '../helper'
import { getNetworkClient } from '@clients'
import { ChannelRepository } from '@/repositories/channel.repository'
import { sendProactiveMessage } from '@/logics/oauth.logic'
import { Types } from '@tribeplatform/gql-client'
const logger = globalLogger.setContext(`NetworkSubscription`)
export const handleSpaceJoinRequestSubscription = async (
  webhook: SubscriptionWebhook<any>,
): Promise<void> => {
  logger.debug('handleSpaceJoinRequestSubscription called', { webhook })

  const {
    networkId,
    data: {
      verb,
      object: { spaceId, memberId, updatedById },
    },
  } = webhook
  let message: string = ''
  let channels: string[] = []
  const gqlClient = await getNetworkClient(networkId)
  const member = await getMember(gqlClient,memberId)
  const space = await getSpace(gqlClient,spaceId)
  const actor = await getMember(gqlClient,updatedById)
    switch (verb) {
        case EventVerb.CREATED:
            channels =  (
                await ChannelRepository.findMany({
                  where: { networkId: networkId, spaceIds: spaceId, spaceJoinRequestCreated: true },
                })
              ).map(channel => channel.channelId)
             message = `${member} requested to join ${space.name}`
            await sendProactiveMessage(message, channels, space.url)
            break
        case EventVerb.ACCEPTED:
            channels =  (
                await ChannelRepository.findMany({
                  where: { networkId: networkId, spaceIds: spaceId, spaceJoinRequestAccepted: true },
                })
              ).map(channel => channel.channelId)
               message = `${actor} accepted ${member}'s request to join ${space.name}`
              await sendProactiveMessage(message, channels, space.url)
            break
        default:
            break
    }

}