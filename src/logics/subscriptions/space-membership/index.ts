import { getNetworkClient } from '@clients'
import { SubscriptionWebhook } from '@interfaces'
import { EventVerb } from '@tribeplatform/gql-client/global-types'
import {  globalLogger } from '@utils'


import { getMember, getSpace } from '../helper'
import { ChannelRepository } from '@/repositories/channel.repository'
import { memberShipSpace } from './space-membership.logic'

const logger = globalLogger.setContext(`NetworkSubscription`)

export const handleSpaceMembershipSubscription = async (
  webhook: SubscriptionWebhook<any>,
): Promise<void> => {
  logger.debug('handlePostSubscription called', { webhook })

  const {
    networkId,
    data: {
      verb,
      actor: { id: actorId },
      object: { spaceId, memberId },
    },
  } = webhook
  let self : boolean = false
  let channels: string[] = []
  const gqlClient = await getNetworkClient(networkId)
  const space = await getSpace(gqlClient, spaceId)
  const actor = await getMember(gqlClient, actorId)
  const member = await getMember(gqlClient, memberId)
  if(actorId === memberId) self = true
  switch (verb) {
    case EventVerb.CREATED:
        channels =  (
            await ChannelRepository.findMany({
              where: { networkId: networkId, spaceIds: spaceId, spaceMemberCreated: true },
            })
          ).map(channel => channel.channelId)
            await memberShipSpace(member, self, verb, space, channels, actor)
        break
    case EventVerb.DELETED:
        channels =  (
            await ChannelRepository.findMany({
              where: { networkId: networkId, spaceIds: spaceId, spaceMemberDeleted: true },
            })
          ).map(channel => channel.channelId)
          await memberShipSpace(member, self, verb, space, channels, actor)
        break
        }
}