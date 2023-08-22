import { ErrorCode, WebhookStatus } from '@enums'
import { GeneralWebhookResponse, SubscriptionWebhook } from '@interfaces'
import { EventNoun, EventVerb } from '@tribeplatform/gql-client/global-types'
import { Network } from '@tribeplatform/gql-client/types'

import { globalLogger } from '@utils'
import { handleNetworkSubscription } from './network'
import { handlePostCreated } from './network/handleEventsTeams'
import { ChannelRepository } from '@/repositories/channel.repository'

const logger = globalLogger.setContext(`Subscription`)

export const handleSubscriptionWebhook = async (
  webhook: SubscriptionWebhook,
): Promise<GeneralWebhookResponse> => {
  logger.debug('handleSubscriptionWebhook called', { webhook })

  const {
    data: { name },
    
  } = webhook
  const channleReps = await ChannelRepository.findMany()
  console.log(channleReps)
  try {
    switch (name) {
      // case EventNoun.NETWORK:
      //   await handleNetworkSubscription(webhook as SubscriptionWebhook<Network>)
      case 'post.published':
        if (!webhook.data.object.isReply){
        console.log('post.published', webhook.data.object, webhook.entities.actor)
        const actor = webhook.entities.actor.name
        const title = webhook.data.object.title
        const url = webhook.data.object.url
        let chanels: string[] = []
        channleReps.forEach((chanel) => { console.log(chanel)
           if (chanel.post == true) chanels.push(chanel.channelId) })
        handlePostCreated(actor, url, title, chanels)
        }
        // return {
        //   type: webhook.type,
        //   status: WebhookStatus.Succeeded,
    
        // }
        break
      case 'moderation.created':
        console.log('moderation.created')
        break
      case 'moderation.rejected':
        console.log('moderation.rejected')
        break
      case 'moderation.accepted':
        console.log('moderation.accepted')
        break
      case 'space_membership.created':
        console.log('space_membership.created')
        break
      case 'space_membership.deleted':
        console.log('space_membership.deleted')
        break
      case 'space_join_request.created':
        console.log('space_join_request.created')
        break
      case 'space_join_request.accepted':
        console.log('space_join_request.accepted')
        break
      case 'member_invitation.created':
        console.log('member_invitation.created')
        break
      case 'member.verified':
        console.log('member.verified')
        break
      
    }
  } catch (error) {
    logger.error(error)
    return {
      type: webhook.type,
      status: WebhookStatus.Failed,
      errorCode: error.code || ErrorCode.ServerError,
      errorMessage: error.message,
    }
  }

  return {
    type: webhook.type,
    status: WebhookStatus.Succeeded,
  }
}
