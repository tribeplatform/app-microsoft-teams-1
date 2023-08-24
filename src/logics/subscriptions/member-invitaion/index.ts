import { SubscriptionWebhook } from '@interfaces'
import { EventVerb } from '@tribeplatform/gql-client/global-types'
import { globalLogger } from '@utils'
import { getMember } from '../helper'
import { getNetworkClient } from '@clients'
import { ChannelRepository } from '@/repositories/channel.repository'
import { sendProactiveMessage } from '@/logics/oauth.logic'
import { Types } from '@tribeplatform/gql-client'
const logger = globalLogger.setContext(`NetworkSubscription`)
export const handleMemberInvitaionSubscription = async (
  webhook: SubscriptionWebhook<any>,
): Promise<void> => {
  logger.debug('handleMemberInvitaionSubscription called', { webhook })

  const {
    networkId,
    data: { verb, object },
  } = webhook
  const member = {
    id: object?.id,
    email: object?.inviteeEmail,
    name: object?.inviteeName
      ? `${object?.inviteeName} (${object?.inviteeEmail})`
      : object?.inviteeEmail,
    createdAt: object?.createdAt,
    networkId: object?.networkId,
  } as Types.Member
  const spaceIdsList: string[] = JSON.parse(object?.extraInfo.defaultSpacesIds)
  console.log(spaceIdsList[0])
  const gqlClient = await getNetworkClient(networkId)
  const actor = await getMember(gqlClient, object?.inviterId)
  const channels: string[] = []
  for (let i = 0; i < spaceIdsList.length; i++) {
    console.log(spaceIdsList[i])
    const channel = (
      await ChannelRepository.findMany({
        where: { networkId: networkId, memberInvitionAccepted: true, spaceIds: spaceIdsList[i] },
      })
    ).map(channel => channel.channelId)
    console.log(channel)
    channels.push(...channel)
  }
  console.log(channels)

  switch (verb) {
    case EventVerb.CREATED:
      const message = `${actor.name} invited ${member.email} to the community.`
      await sendProactiveMessage(message, channels)
      break
    default:
      break
  }
}
