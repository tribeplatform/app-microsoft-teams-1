import { SubscriptionWebhook } from '@interfaces'
import { globalLogger } from '@utils'
import { getMember, getPost, getSpace, sendProactiveMessage } from '../helper'
import { getNetworkClient } from '@clients'
import { Types } from '@tribeplatform/gql-client'
import { EventVerb } from '@tribeplatform/gql-client/global-types'
import { ChannelRepository } from '@/repositories/channel.repository'
import { Member, Post } from '@tribeplatform/gql-client/types'
const logger = globalLogger.setContext(`NetworkSubscription`)

export const handleModerationSubscription = async (
  webhook: SubscriptionWebhook<any>,
): Promise<void> => {
  const {
    networkId,
    data: { verb, object, name, actor: { id }, target },
  } = webhook
  logger.debug('handleModerationSubscription called', { webhook })
  const gqlClient = await getNetworkClient(networkId)
  let post: Post
  let member: Member
  let message: string = ''
  let channels: string[] = (
    await ChannelRepository.findMany({
      where: { networkId: networkId, spaceIds: object?.spaceId, events: { has: name } },
    })
  ).map(channel => channel.channelId)
  let type = ''
  if (object.entityType === Types.ModerationEntityType.POST){
    type = 'post'
  }
  else if(object.entityType === Types.ModerationEntityType.MEMBER){
    type = 'member'
  }
    member = await getMember(gqlClient, id)
    post = await getPost(gqlClient, target.postId)
  const [actor] = await Promise.all([
    getMember(gqlClient, id),
  ])
  console.log(member)
  const url = `https://${target.networkDomain}/member/${member.id}`
  switch (verb) {
    case EventVerb.CREATED:
      message = `A ${type} was flagged for moderation`
      break
    case EventVerb.REJECTED:
      message = `${actor.name} approved this post`
      break
    case EventVerb.ACCEPTED:
      message = `${actor.name} rejected this post`
      break
    default:
      break
  }
  if (message && channels.length > 0)
    await sendProactiveMessage({message, channels, postUrl:post.url, mode:name, userUrl:url, actorUrl:actor.url})
}
