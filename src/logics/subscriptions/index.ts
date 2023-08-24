import { ErrorCode, WebhookStatus } from '@enums'
import { GeneralWebhookResponse, SubscriptionWebhook } from '@interfaces'
import { EventNoun, EventVerb } from '@tribeplatform/gql-client/global-types'
import { Member, Network, Post } from '@tribeplatform/gql-client/types'
import { globalLogger } from '@utils'
import { handleNetworkSubscription } from './network'
import {
  handlePostCreated,
  memberInvitation,
  memberShipSpace,
  memberVerified,
  modration,
  spaceJoinRequest,
} from './network/handleEventsTeams'
import { ChannelRepository } from '@/repositories/channel.repository'
import { getSpaces } from '../interactions/dynamic-blocks/settings/microsoft-info.logic'
import { NetworkRepository } from '@repositories'
import { getNetworkClient } from '@clients'
import { handlePostSubscription } from './post'
import { handleMemberSubscription } from './member'
import { handleSpaceMembershipSubscription } from './space-membership'
import { handleModerationSubscription } from './moderation'
import { handleMemberInvitaionSubscription } from './member-invitaion'
import { handleSpaceJoinRequestSubscription } from './space-join-request'

const logger = globalLogger.setContext(`Subscription`)

export const handleSubscriptionWebhook = async (
  webhook: SubscriptionWebhook,
): Promise<GeneralWebhookResponse> => {
  logger.debug('handleSubscriptionWebhook called', { webhook })

  const {
    data: { noun },
  } = webhook

  try {
    switch (noun) {
      case EventNoun.SPACE_JOIN_REQUEST:
        await handleSpaceJoinRequestSubscription(webhook as SubscriptionWebhook<any>)
        break
      case EventNoun.MEMBER_INVITATION:
        await handleMemberInvitaionSubscription(webhook as SubscriptionWebhook<any>)
        break
      case EventNoun.MODERATION:
        await handleModerationSubscription(webhook as SubscriptionWebhook<any>)
        break
      case EventNoun.NETWORK:
        await handleNetworkSubscription(webhook as SubscriptionWebhook<Network>)
        break
      case EventNoun.MEMBER:
        await handleMemberSubscription(webhook as SubscriptionWebhook<Member>)
        break
      case EventNoun.POST:
        await handlePostSubscription(webhook as SubscriptionWebhook<Post>)
        break
      case EventNoun.SPACE_MEMBERSHIP:
        await handleSpaceMembershipSubscription(webhook as SubscriptionWebhook<any>)
        break
      default:
        break
    }
  } catch (error) {
    // try {
    //   switch (noun) {
    //     case 'post.published':
    //       if (!webhook.data.object.isReply) {
    //         console.log('post.published', webhook.data.object, webhook.entities.actor)
    //         actor = webhook.entities.actor.name
    //         title = webhook.data.object.title
    //         url = webhook.data.object.url

    //         channleReps.forEach(channel => {
    //           // console.log(channel)
    //           if (channel.post == true && webhook.data.object.spaceId == channel.spaceIds)
    //             channels.push(channel.channelId)
    //         })
    //         handlePostCreated(actor, url, title, channels)
    //       }
    //       break
    //     case 'moderation.created':
    //       member = webhook.entities.targetMember.name
    //       mode = 'created'
    //       channleReps.forEach(channel => {
    //         console.log(channel)
    //         if (
    //           channel.modarationCreated == true &&
    //           webhook.data.object.spaceId == channel.spaceIds
    //         )
    //           channels.push(channel.channelId)
    //       })
    //       await modration({ member: member }, mode, url, channels)
    //       console.log('moderation.created')
    //       break
    //     case 'moderation.rejected':
    //       actor = webhook.entities.actor.name
    //       mode = 'rejected'
    //       channleReps.forEach(channel => {
    //         console.log(channel)
    //         if (
    //           channel.modarationRejected == true &&
    //           webhook.data.object.spaceId == channel.spaceIds
    //         )
    //           channels.push(channel.channelId)
    //       })
    //       await modration({ actor: actor }, mode, url, channels)
    //       console.log('moderation.rejected')
    //       break
    //     case 'moderation.accepted':
    //       actor = webhook.entities.actor.name
    //       mode = 'accepted'
    //       channleReps.forEach(channel => {
    //         console.log(channel)
    //         if (
    //           channel.modarationAccepted == true &&
    //           webhook.data.object.spaceId == channel.spaceIds
    //         )
    //           channels.push(channel.channelId)
    //       })
    //       await modration({ actor: actor }, mode, url, channels)
    //       console.log('moderation.accepted')
    //       break
    //     case 'space_membership.created':
    //       actor = webhook.entities.actor.name
    //       member = webhook.entities.targetMember.name
    //       spaceId = webhook.data.object.spaceId
    //       spacesList = await getSpaces(webhook.networkId)
    //       space = spacesList.find(space => space.id == spaceId).name
    //       self = false
    //       mode = 'created'
    //       if (webhook.entities.actor.id == webhook.entities.targetMember.id) {
    //         self = true
    //       }
    //       channleReps.forEach(channel => {
    //         console.log(channel)
    //         if (
    //           channel.spaceMemberCreated == true &&
    //           webhook.data.object.spaceId == channel.spaceIds
    //         )
    //           channels.push(channel.channelId)
    //       })
    //       await memberShipSpace({ member: member, space: space, actor: actor },self, mode, channels)
    //       console.log('space_membership.created')
    //       break
    //     case 'space_membership.deleted':
    //       actor = webhook.entities.actor.name
    //       member = webhook.entities.targetMember.name
    //       spaceId = webhook.data.object.spaceId
    //       spacesList = await getSpaces(webhook.networkId)
    //       space = spacesList.find(space => space.id == spaceId).name
    //       self = false
    //       mode = 'deleted'
    //       if (webhook.entities.actor.id == webhook.entities.targetMember.id) {
    //         self = true
    //       }
    //       channleReps.forEach(channel => {
    //         console.log(channel)
    //         if (
    //           channel.spaceMemberDeleted == true &&
    //           webhook.data.object.spaceId == channel.spaceIds
    //         )
    //           channels.push(channel.channelId)
    //       })
    //       await memberShipSpace({ member: member, space: space, actor: actor },self, mode, channels)
    //       console.log('space_membership.deleted')
    //       break
    //     case 'space_join_request.created':
    //       member = webhook.entities.targetMember.name
    //       spaceId = webhook.data.object.spaceId
    //       spacesList = await getSpaces(webhook.networkId)
    //       space = spacesList.find(space => space.id == spaceId).name
    //       mode = 'created'
    //       channleReps.forEach(channel => {
    //         console.log(channel)
    //         if (
    //           channel.spaceJoinRequestCreated == true &&
    //           webhook.data.object.spaceId == channel.spaceIds
    //         )
    //           channels.push(channel.channelId)
    //       })
    //       await spaceJoinRequest({ member: member, space: space }, mode, channels)
    //       console.log('space_join_request.created')
    //       break
    //     case 'space_join_request.accepted':
    //       actor = webhook.entities.actor.name
    //       member = webhook.entities.targetMember.name
    //       spaceId = webhook.data.object.spaceId
    //       spacesList = await getSpaces(webhook.networkId)
    //       space = spacesList.find(space => space.id == spaceId).name
    //       mode = 'accepted'
    //       channleReps.forEach(channel => {
    //         if (
    //           channel.spaceJoinRequestAccepted == true &&
    //           webhook.data.object.spaceId == channel.spaceIds
    //         )
    //           channels.push(channel.channelId)
    //       })
    //       await spaceJoinRequest(
    //         { member: member, space: space, actor: actor },
    //         mode,
    //         channels,
    //       )
    //       console.log('space_join_request.accepted')
    //       break
    //     case 'member_invitation.created':
    //       const nameSender = webhook.entities.actor.name
    //       const nameReciver = webhook.data.object.inviteeEmail
    //       channleReps.forEach(channel => {
    //         if (
    //           channel.memberInvitionAccepted == true &&
    //           webhook.data.object.spaceId == channel.spaceIds
    //         )
    //           channels.push(channel.channelId)
    //       })
    //       await memberInvitation({ actor: nameSender, member: nameReciver }, channels)
    //       console.log('member_invitation.created')
    //       break
    //     case 'member.verified':
    //       channleReps.forEach(channel => {
    //         if (
    //           channel.memberVerified == true &&
    //           webhook.data.object.spaceId == channel.spaceIds
    //         )
    //           channels.push(channel.channelId)
    //       })
    //       const message = webhook.data.object.name
    //       await memberVerified({ member: message }, channels)
    //       console.log('member.verified')
    //       break
    //   }
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
