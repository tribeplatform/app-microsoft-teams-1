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
      target,
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
  const url = member.url || `https://${target.networkDomain}/member/${member.id}`
  if (actorId === memberId || actorId === null) self = true
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
        message = `${actor.name} removed ${member.name} from ${space.name}`
      }
      break
  }
  if (message && channels.length > 0)
    await sendProactiveMessage({message, channels,spaceUrl:space.url, mode:name, userUrl:url, actorUrl:actor.url,self})
}
