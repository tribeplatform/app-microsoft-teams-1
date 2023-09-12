import { SubscriptionWebhook } from '@interfaces'
import { EventVerb } from '@tribeplatform/gql-client/global-types'
import { Member } from '@tribeplatform/gql-client/types'
import { globalLogger } from '@utils'
import { getMember, getSpace, sendProactiveMessage } from '../helper'
import { getNetworkClient } from '@clients'
import { ChannelRepository } from '@/repositories/channel.repository'
const logger = globalLogger.setContext(`NetworkSubscription`)
export const handleSpaceJoinRequestSubscription = async (
  webhook: SubscriptionWebhook<any>,
): Promise<void> => {
  logger.debug('handleSpaceJoinRequestSubscription called', { webhook })

  const {
    networkId,
    data: {
      name,
      verb,
      object: { spaceId, memberId, updatedById },
    },
  } = webhook
  let message: string = ''
  let channels: string[] = (
    await ChannelRepository.findMany({
      where: {
        networkId: networkId,
        spaceIds: spaceId,
        events: {
          has: name,
        },
      },
    })
  ).map(channel => channel.channelId)
  const gqlClient = await getNetworkClient(networkId)
  const [member, space, actor] = await Promise.all([
    getMember(gqlClient, memberId),
    getSpace(gqlClient, spaceId),
    getMember(gqlClient, updatedById),
  ])
  const mode = 'space'
  switch (verb) {
    case EventVerb.CREATED:
      message = `${member} requested to join ${space.name}`
      break
    case EventVerb.ACCEPTED:
      message = `${actor} accepted ${member}'s request to join ${space.name}`
      break
    default:
      break
  }
  if (message && channels.length > 0)
    await sendProactiveMessage(message, channels, space.url, null, mode)
}
