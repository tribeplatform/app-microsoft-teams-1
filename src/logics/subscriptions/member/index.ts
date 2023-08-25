import { SubscriptionWebhook } from '@interfaces'
import { EventVerb } from '@tribeplatform/gql-client/global-types'
import { Member } from '@tribeplatform/gql-client/types'
import { globalLogger } from '@utils'
import { getMember, sendProactiveMessage } from '../helper'
import { getNetworkClient } from '@clients'
import { ChannelRepository } from '@/repositories/channel.repository'

const logger = globalLogger.setContext(`NetworkSubscription`)
export const handleMemberSubscription = async (
  webhook: SubscriptionWebhook<Member>,
): Promise<void> => {
  logger.debug('handleMemberSubscription called', { webhook })

  const {
    networkId,
    data: {
      verb,
      name,
      object: { id },
    },
  } = webhook
  let message: string = ''
  const gqlClient = await getNetworkClient(networkId)
  const member = await getMember(gqlClient, id)
  const channels = (
    await ChannelRepository.findMany({
      where: { networkId: networkId, events: { has: name } },
    })
  ).map(channel => channel.channelId)

  switch (verb) {
    case EventVerb.VERIFIED:
      message = `${member.name} joined the community.`
      break
    default:
      break
  }
  if (message && channels.length > 0) await sendProactiveMessage(message, channels)
}
