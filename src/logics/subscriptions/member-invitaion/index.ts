import { SubscriptionWebhook } from '@interfaces'
import { EventVerb } from '@tribeplatform/gql-client/global-types'
import { globalLogger } from '@utils'
import { getMember, sendProactiveMessage } from '../helper'
import { getNetworkClient } from '@clients'
import { ChannelRepository } from '@/repositories/channel.repository'

import { Types } from '@tribeplatform/gql-client'
const logger = globalLogger.setContext(`NetworkSubscription`)
export const handleMemberInvitaionSubscription = async (
  webhook: SubscriptionWebhook<any>,
): Promise<void> => {
  logger.debug('handleMemberInvitaionSubscription called', { webhook })

  const {
    networkId,
    data: { name, verb, object, target },
  } = webhook
  let message: string = ''
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
  const gqlClient = await getNetworkClient(networkId)
  const actor = await getMember(gqlClient, object?.inviterId)
  const channels: string[] = []
  for (let i = 0; i < spaceIdsList.length; i++) {
    const channel = (
      await ChannelRepository.findMany({
        where: { networkId: networkId, events: { has: name }, spaceIds: spaceIdsList[i] },
      })
    ).map(channel => channel.channelId)
    channels.push(...channel)
  }
  const url = member.url || `https://${target.networkDomain}/member/${member.id}`
  const mode = 'user'
  console.log(url)
  switch (verb) {
    case EventVerb.CREATED:
      message = `${actor.name} invited ${member.email} to the community.`
      break
    default:
      break
  }
  if (message && channels.length > 0) await sendProactiveMessage(message, channels,url,null ,mode)
}
