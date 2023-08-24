import { SubscriptionWebhook } from '@interfaces'
import { EventVerb } from '@tribeplatform/gql-client/global-types'
import { Post } from '@tribeplatform/gql-client/types'
import { globalLogger } from '@utils'
import { handlePostCreated } from './post.logic'
import { Types } from '@tribeplatform/gql-client'
import { getNetworkClient } from '@clients'
import { getMember, getPost, getSpace } from '../helper'
import { ChannelRepository } from '@/repositories/channel.repository'
const logger = globalLogger.setContext(`NetworkSubscription`)

export const handlePostSubscription = async (
  webhook: SubscriptionWebhook<Post>,
): Promise<void> => {
  logger.debug('handlePostSubscription called', { webhook })
  const {
    networkId,
    data: { verb, object },
  } = webhook
  const channleReps = (
    await ChannelRepository.findMany({
      where: { networkId: networkId, spaceIds: object?.spaceId, post: true },
    })
  ).map(channel => channel.channelId)
  console.log(channleReps, ' channels')
  const gqlClient = await getNetworkClient(networkId)
  const post = await getPost(gqlClient, (object as Types.Post)?.id)
  const actor = await getMember(gqlClient, (object as Types.Post)?.createdById)
  const space = await getSpace(gqlClient, (object as Types.Post)?.spaceId)
  console.log(post, actor, space, ' gettting data')
  switch (verb) {
    case EventVerb.PUBLISHED:
      await handlePostCreated(actor, post, space, channleReps)
      break
    default:
      break
  }
}
