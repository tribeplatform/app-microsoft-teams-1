import { SubscriptionWebhook } from '@interfaces'
import { EventVerb } from '@tribeplatform/gql-client/global-types'
import { Member } from '@tribeplatform/gql-client/types'
import { globalLogger } from '@utils'
import { getMember } from '../helper'
import { getNetworkClient } from '@clients'
import { ChannelRepository } from '@/repositories/channel.repository'
import { sendProactiveMessage } from '@/logics/oauth.logic'
const logger = globalLogger.setContext(`NetworkSubscription`)
export const handleMemberSubscription = async (
  webhook: SubscriptionWebhook<Member>,
): Promise<void> => {
  logger.debug('handleMemberSubscription called', { webhook })

  const {
    networkId,
    data: {
      verb,
      object: { id },
    },
  } = webhook
  const gqlClient = await getNetworkClient(networkId)
  const member = await getMember(gqlClient, id)
  const channels = (
    await ChannelRepository.findMany({
      where: { networkId: networkId, memberVerified: true },
    })
  ).map(channel => channel.channelId)

  switch (verb) {
    case EventVerb.VERIFIED:
      const message = `${member} joined the community.`
      await sendProactiveMessage(message, channels)
      break
    default:
      break
  }
}
