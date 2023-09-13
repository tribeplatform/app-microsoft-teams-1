import { getNetworkClient } from '@clients'
import { SubscriptionWebhook } from '@interfaces'
import { EventVerb } from '@tribeplatform/gql-client/global-types'
import { globalLogger } from '@utils'

import { getMember, getSpace, sendProactiveMessage } from '../helper'
import { ChannelRepository } from '@/repositories/channel.repository'

const logger = globalLogger.setContext(`NetworkSubscription`)

export const handleSpaceMembershipSubscription = async (
  webhook: SubscriptionWebhook<any>,
): Promise<void> => {
  logger.debug('handlePostSubscription called', { webhook })

  const {
    networkId,
    data: {
      name,
      verb,
      actor: { id: actorId },
      object: { spaceId, memberId },
    },
  } = webhook
  let self: boolean = false
  let message: string = ''
  let channels: string[] = (
    await ChannelRepository.findMany({
      where: { networkId: networkId, spaceIds: spaceId, events: { has: name } },
    })
  ).map(channel => channel.channelId)
  const gqlClient = await getNetworkClient(networkId)
  const [space, actor, member] = await Promise.all([
    getSpace(gqlClient, spaceId),
    getMember(gqlClient, actorId) || null,
    getMember(gqlClient, memberId),
  ])
  if (actorId === memberId || actorId === null) self = true
  const mode = 'space'
  switch (verb) {
    case EventVerb.CREATED:
      if (self == true) {
        message = `${member.name} joined ${space.name}`
      } else {
        message = `${actor.name} added ${member.name} to ${space.name} `
      }
      break
    case EventVerb.DELETED:
      if (self == true) {
        message = `${member.name} left ${space.name}`
      } else {
        message = `${actor.name} removed ${member} from ${space.name}`
      }
      break
  }
  if (message && channels.length > 0)
    await sendProactiveMessage(message, channels, space.url,null ,mode)
}
