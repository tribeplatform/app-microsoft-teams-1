import { SubscriptionWebhook } from '@interfaces'
import { EventVerb } from '@tribeplatform/gql-client/global-types'
import { Post } from '@tribeplatform/gql-client/types'
import { globalLogger } from '@utils'
import { Types } from '@tribeplatform/gql-client'
import { getNetworkClient } from '@clients'
import { getMember, getPost, getSpace, sendProactiveMessage } from '../helper'
import { ChannelRepository } from '@/repositories/channel.repository'
const logger = globalLogger.setContext(`NetworkSubscription`)

export const handlePostSubscription = async (
  webhook: SubscriptionWebhook<Post>,
): Promise<void> => {
  logger.debug('handlePostSubscription called', { webhook })
  const {
    networkId,
    data: { verb,name, object },
  } = webhook
  let message: string = ''
  const channleReps = (
    await ChannelRepository.findMany({
      where: { networkId: networkId, spaceIds: object?.spaceId, events: { has: name } },
    })
  ).map(channel => channel.channelId)
  console.log(channleReps, ' channels')
  const gqlClient = await getNetworkClient(networkId)
  const [post, actor, space] = await Promise.all([ getPost(gqlClient, (object as Types.Post)?.id), getMember(gqlClient, (object as Types.Post)?.createdById), getSpace(gqlClient, (object as Types.Post)?.spaceId)])
  switch (verb) {
    case EventVerb.PUBLISHED:
      message = `${actor.name} added a post with the title ${post.title}!`
      break
    default:
      break
  }
  await sendProactiveMessage(message, channleReps, post.url)
}
