import { InteractionType, ToastStatus, WebhookStatus, WebhookType } from '@enums'
import {
  InteractionInput,
  InteractionWebhook,
  InteractionWebhookResponse,
  RedirectInteractionProps,
} from '@interfaces'
import { Network } from '@prisma/client'
import { NetworkRepository } from '@repositories'

import {
  getAppToken,
  getConnectMicrosoftUrl,
  installingBotTeams,
  sendProactiveMessage,
} from '@/logics/oauth.logic'
import { ChannelRepository } from '@/repositories/channel.repository'
import { getNetworkClient } from '@clients'
import { rawSlateToDto, slateDtoToRaw } from '@tribeplatform/slate-kit/utils'
import { globalLogger } from '@utils'
import { getInteractionNotSupportedError } from '../../../error.logics'
import { SettingsBlockCallback } from './constants'
import {
  getConnectModalResponse,
  getConnectedSettingsResponse,
  getDisconnectedSettingsResponse,
  getOpenToastCallbackResponse,
} from './helper'
import { getListOfChannels, getListOfTeams, getSpaces } from './microsoft-info.logic'
import { getConnectModalSlate } from './slates/connect-modal.slate'
import { getNetworkSettingsInteractionResponse } from './interaction.logics'
import { type } from 'os'
import { getConnectedSettingsSlate2 } from './slates/connected-inputAdded.slate'
import { send } from 'process'
import { RawBlockDto } from '@tribeplatform/slate-kit/dtos'
import { deleteModal } from './slates/delete-modal.slate'

const logger = globalLogger.setContext(`SettingsDynamicBlock`)

const getRedirectCallbackResponseMicrosoft = async ({
  props,
  interactionId,
}: {
  props: RedirectInteractionProps
  interactionId?: string
}): Promise<InteractionWebhookResponse> => ({
  type: WebhookType.Interaction,
  status: WebhookStatus.Succeeded,
  data: {
    interactions: [
      {
        id: interactionId || 'new-interaction-id',
        type: InteractionType.Redirect,
        props,
      },
    ],
  },
})
const getAuthRedirectCallbackResponse = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  logger.debug('getAuthRedirectCallbackResponse called', { options })
  const {
    networkId,
    data: { actorId },
  } = options
  console.log('networkId2', networkId)
  const gqlClient = await getNetworkClient(networkId)
  console.log('gp', !!gqlClient.query, !!gqlClient.graphqlUrl)
  let network
  try {
    network = await gqlClient.query({
      name: 'network',
      args: 'basic',
    })
  } catch (e) {
    console.log(e)
  }

  return getRedirectCallbackResponseMicrosoft({
    props: {
      url: await getConnectMicrosoftUrl({
        network,
        actorId,
      }),
      external: false,
    },
  })
}
const getAuthRevokeCallbackResponse = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  logger.debug('getAuthRedirectCallbackResponse called')
  logger.debug('handleUninstalledWebhook called')
  const {
    networkId,
    data: { interactionId },
  } = options
  try {
    await NetworkRepository.delete(networkId)
    await ChannelRepository.deleteMany()
  } catch (error) {
    logger.error(error)
    // return getServiceUnavailableError(webhook)
  }

  return getDisconnectedSettingsResponse({ interactionId })
}

const getOpenModalCallbackResponse = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  const { networkId, data } = options
  logger.debug('getConnectCallbackResponse called', { networkId })

  const user = await NetworkRepository.findUnique(networkId)
  const accessToken = await getAppToken(user.tenantId)

  const spacesList = await getSpaces(networkId)

  const spaces = spacesList.map(space => ({ value: space.id, text: space.name }))

  const teams = await getListOfTeams(
    accessToken,

    user.microsoftId,
  )
  console.log('Spaces:', spaces)
  console.log('teams:', teams)

  return getConnectModalResponse({
    user: await NetworkRepository.findUniqueOrThrow(networkId),
    spaces: spaces, // Pass the spaces dictionary to the 'spaces' parameter in getConnectModalResponse
    teams: teams,
    channels: [],
  })
}

const getFetchChannelsCallbackResponse = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  const { networkId, data } = options
  const { teamId, spaceId,  } = data.inputs.formValues as any // Destructure 'selectedTeamId' and 'selectedSpacesId' from 'inputs'

  // Your code here to fetch the channels for the selected team and space
  try {
    const user = await NetworkRepository.findUnique(networkId)
    const accessToken = await getAppToken(user.tenantId)

    const spacesList = await getSpaces(networkId)
    const teams = await getListOfTeams(
      accessToken,

      user.microsoftId,
    )
    const spaces = spacesList.map(space => ({ value: space.id, text: space.name }))

    for (var i = 0; i < spaces.length; i++) {
      if (spaces[i].value == spaceId) {
        let element = spaces[i]
        spaces.splice(i, 1)
        spaces.splice(0, 0, element)
      }
    }

    for (var i = 0; i < teams.length; i++) {
      if (teams[i].value == teamId) {
        let element = teams[i]
        teams.splice(i, 1)
        teams.splice(0, 0, element)
      }
    }

    const channels = await getListOfChannels(accessToken, teamId as string)
    console.log('Channels:', channels)
    console.log('teams:', teamId)
    console.log('spaces:', spaceId)

    // Now that you have the channels, update the slate with the new items for the channels dropdown
    const updatedModalSlate = await getConnectModalSlate({
      spaces: spaces,
      teams: teams,
      channels: channels,
      showTeams: true,
    })
    console.log(
      JSON.stringify({
        type: WebhookType.Interaction,
        status: WebhookStatus.Succeeded,
        data: {
          interactions: [
            {
              id: data.interactionId,
              type: InteractionType.Show,
              slate: rawSlateToDto(updatedModalSlate),
            },
          ],
        },
      }),
    )
    // Return the updated slate to the modal
    return {
      type: WebhookType.Interaction,
      status: WebhookStatus.Succeeded,
      data: {
        interactions: [
          {
            id: data.interactionId,
            type: InteractionType.Show,
            slate: rawSlateToDto(updatedModalSlate),
          },
        ],
      },
    }
  } catch (error) {
    console.error('Error fetching channels:')
    // Handle the error in some way, e.g., show an error toast to the user
    return getOpenToastCallbackResponse({
      networkId: networkId,
      data: {
        interactionId: data.interactionId,
        title: 'Error',
        description: 'Error',
      },
    })
  }
}
const getFetchChannelsCallbackResponseUpgrade = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  const { networkId, data } = options
  const { teamId, spaceId,  } = data.inputs.formValues as any // Destructure 'selectedTeamId' and 'selectedSpacesId' from 'inputs'
  const callback = data.callbackId as string
  const id = callback.split('-')[1]
  // Your code here to fetch the channels for the selected team and space
  try {
    const user = await NetworkRepository.findUnique(networkId)
    const accessToken = await getAppToken(user.tenantId)

    const spacesList = await getSpaces(networkId)
    const teams = await getListOfTeams(
      accessToken,

      user.microsoftId,
    )
    const spaces = spacesList.map(space => ({ value: space.id, text: space.name }))

    for (var i = 0; i < spaces.length; i++) {
      if (spaces[i].value == spaceId) {
        let element = spaces[i]
        spaces.splice(i, 1)
        spaces.splice(0, 0, element)
      }
    }

    for (var i = 0; i < teams.length; i++) {
      if (teams[i].value == teamId) {
        let element = teams[i]
        teams.splice(i, 1)
        teams.splice(0, 0, element)
      }
    }
    console.log('errrrroorororororor')
    const channels = await getListOfChannels(accessToken, teamId as string)
    console.log('Channels:', channels)
    console.log('teams:', teamId)
    console.log('spaces:', spaceId)

    // Now that you have the channels, update the slate with the new items for the channels dropdown
    const updatedModalSlate = await getConnectModalSlate({
      objectId: id,
      upgradeMode: true,
      spaces: spaces,
      teams: teams,
      channels: channels,
      showTeams: true,
    })

    return {
      type: WebhookType.Interaction,
      status: WebhookStatus.Succeeded,
      data: {
        interactions: [
          {
            id: data.interactionId,
            type: InteractionType.Show,
            slate: rawSlateToDto(updatedModalSlate),
          },
        ],
      },
    }
  } catch (error) {
    console.error('Error fetching channels:', error)
    // Handle the error in some way, e.g., show an error toast to the user
    return getOpenToastCallbackResponse({
      networkId: networkId,
      data: {
        interactionId: data.interactionId,
        title: 'Error',
        description: 'Error',
      },
    })
  }
}

const handleSaveButtonClick = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  const { networkId, data } = options
  const {
    spaceId: spaces,
    teamId: teams,
    channelId,
    post,
    modarationCreated,
    modarationRejected,
    memberInvitionAccepted,
    spaceMemberDeleted,
    spaceMemberCreated,
    spaceJoinRequestCreated,
    spaceJoinRequestAccepted,
    modarationAccepted,
    memberVerified
  } = data.inputs
  console.log('hi', data.inputs)
  const channelReps = await ChannelRepository.findMany()
  try {
    for (var i = 0; i < channelReps.length; i++) {
      if (
        channelReps[i].channelId == channelId &&
        channelReps[i].teamId == teams &&
        channelReps[i].spaceIds == spaces
      ) {
        return getOpenToastCallbackResponse({
          networkId: networkId,
          data: {
            interactionId: data.interactionId,
            title: 'Error',
            description: 'Error saving data, this channel is already connected',
          },
        })
      }
    }

    // Save the user's selections in the database, along with other existing fields
    console.log('hi', teams)
    await ChannelRepository.create({
      networkId: networkId as string,
      spaceIds: spaces as string,
      teamId: teams as string,
      channelId: channelId as string,
      post: post as boolean,
      modarationCreated: modarationCreated as boolean,
      modarationRejected: modarationRejected as boolean,
      memberInvitionAccepted: memberInvitionAccepted as boolean,
      spaceMemberDeleted: spaceMemberDeleted as boolean,
      spaceMemberCreated: spaceMemberCreated as boolean,
      spaceJoinRequestCreated: spaceJoinRequestCreated as boolean,
      spaceJoinRequestAccepted: spaceJoinRequestAccepted as boolean,
      memberVerified: memberVerified as boolean,
      modarationAccepted: modarationAccepted as boolean,
    })
    // const network = await NetworkRepository.findUnique(networkId)

    const user = await NetworkRepository.findUnique(networkId)
    // return getConnectedSettingsResponse(options.data, network)
    // const updateSlate = getConnectedSettingsSlate2()

    try {
      await installingBotTeams(networkId, user.token, teams, user.tenantId)
    } catch (e) {
      console.error('Error installing bot:', e)
      // Handle the error in some way, e.g., show an error toast to the user
      if (e.response.status == 409) {
        //   return getOpenToastCallbackResponse({
        //     networkId: networkId,
        //     data: {
        //       interactionId: data.interactionId,
        //       title: 'Error',
        //       description: 'bot already exists!',
        //     },
        //   })
        // }
      }
    }
    try {
      const title = 'Community Bot is connected!'
      const message = 'Hi there, *Community Bot* is here! I would inform you on community updates in this channel.'
      //  sendProactiveMessage('Hello amir', [channelId as string])
    } catch (e) {
      console.log(e)
    }

    return {
      type: WebhookType.Interaction,
      status: WebhookStatus.Succeeded,
      data: {
        interactions: [
          {
            id: data.interactionId,
            type: InteractionType.Close,
          },
          {
            id: data.interactionId + 'reaload',
            type: InteractionType.Reload,
            props: {
              dynamicBlockKeys: ['settings'],
            },
          },
        ],
      },
    }
  } catch (error) {
    console.error('Error saving data:', error)
    // Handle the error in some way, e.g., show an error toast to the user
    return getOpenToastCallbackResponse({
      networkId: networkId,
      data: {
        interactionId: data.interactionId,
        title: 'Error',
        description: 'Error saving data',
      },
    })
  }
}
const handleUpdateButtonClick = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  const { networkId, data } = options
  const { spaceId: spaces, teamId: teams, channelId,
    post,
    modarationCreated,
    modarationRejected,
    memberInvitionAccepted,
    spaceMemberDeleted,
    spaceMemberCreated,
    spaceJoinRequestCreated,
    spaceJoinRequestAccepted,
    modarationAccepted,
    memberVerified } = data.inputs
  console.log('hi', data.inputs)
  const callback = data.callbackId as string
  const id = callback.split('-')[1]
  const channelReps = await ChannelRepository.findMany()
  try {
    // for (var i = 0; i < channelReps.length; i++) {
    //   if (
    //     channelReps[i].channelId == channelId &&
    //     channelReps[i].teamId == teams &&
    //     channelReps[i].spaceIds == spaces
    //   ) {
    //     return getOpenToastCallbackResponse({
    //       networkId: networkId,
    //       data: {
    //         interactionId: data.interactionId,
    //         title: 'Error',
    //         description: 'Error saving data, this channel is already connected',
    //       },
    //     })
    //   }
    // }

    await ChannelRepository.update(id, {
      spaceIds: spaces as string,
      teamId: teams as string,
      channelId: channelId as string,
      post: post as boolean,
      modarationCreated: modarationCreated as boolean,
      modarationRejected: modarationRejected as boolean,
      memberInvitionAccepted: memberInvitionAccepted as boolean,
      spaceMemberDeleted: spaceMemberDeleted as boolean,
      spaceMemberCreated: spaceMemberCreated as boolean,
      spaceJoinRequestCreated: spaceJoinRequestCreated as boolean,
      spaceJoinRequestAccepted: spaceJoinRequestAccepted as boolean,
      memberVerified: memberVerified as boolean,
      modarationAccepted: modarationAccepted as boolean,
    })

    // const network = await NetworkRepository.findUnique(networkId)

    const user = await NetworkRepository.findUnique(networkId)
    // return getConnectedSettingsResponse(options.data, network)
    // const updateSlate = getConnectedSettingsSlate2()

    try {
      await installingBotTeams(networkId, user.token, teams, user.tenantId)
    } catch (e) {
      console.error('Error installing bot:', e)
      // Handle the error in some way, e.g., show an error toast to the user
      if (e.response.status == 409) {
        //   return getOpenToastCallbackResponse({
        //     networkId: networkId,
        //     data: {
        //       interactionId: data.interactionId,
        //       title: 'Error',
        //       description: 'bot already exists!',
        //     },
        //   })
        // }
      }
    }
    try {
      //  sendProactiveMessage('Hello amir', [channelId as string])
    } catch (e) {
      console.log(e)
    }

    return {
      type: WebhookType.Interaction,
      status: WebhookStatus.Succeeded,
      data: {
        interactions: [
          {
            id: data.interactionId,
            type: InteractionType.Close,
          },
          {
            id: data.interactionId + 'reaload',
            type: InteractionType.Reload,
            props: {
              dynamicBlockKeys: ['settings'],
            },
          },
        ],
      },
    }
  } catch (error) {
    console.error('Error saving data:', error)
    // Handle the error in some way, e.g., show an error toast to the user
    return getOpenToastCallbackResponse({
      networkId: networkId,
      data: {
        interactionId: data.interactionId,
        title: 'Error',
        description: 'Error saving data',
      },
    })
  }
}
const getRedirectCallbackResponse = async (options: {
  network: Network
  data: InteractionInput<Network>
}): Promise<InteractionWebhookResponse> => ({
  type: WebhookType.Interaction,
  status: WebhookStatus.Succeeded,
  data: {
    interactions: [
      {
        id: 'new-interaction-id',
        type: InteractionType.Redirect,
        props: {
          url: 'https://bettermode.com',
          external: true,
        },
      },
    ],
  },
})
const handleDeleteBlockSure = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  const {
    networkId,
    data: { callbackId, interactionId, inputs },
  } = options
  console.log('hi', options)
  const callback = callbackId as string
  const id = callback.split('-')[1]
  await ChannelRepository.delete(id)

  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: interactionId,
          type: InteractionType.Close,
        },
        {
          id: interactionId + 'reaload',
          type: InteractionType.Reload,
          props: {
            dynamicBlockKeys: ['settings'],
          },
        },
      ],
    },
  }
}
const handleDeleteBlock = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  const {
    networkId,
    data: { callbackId, interactionId, inputs },
  } = options
  const callback = callbackId as string
  const id = callback.split('-')[1]
  const slate = deleteModal({ id: id })
  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          // id: options.interactionId,
          id: 'connect to channels',
          type: InteractionType.OpenModal,
          props: {
            size: 'md',
            title: 'Delete',
          },
          slate: rawSlateToDto(await slate),
        },
      ],
    },
  }
}
const handleEditBlock = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  const {
    networkId,
    data: { callbackId, interactionId, inputs },
  } = options

  const callback = callbackId as string
  const id = callback.split('-')[1]
  console.log('id', id)
  const user = await ChannelRepository.findUnique(id)
  const userRep = await NetworkRepository.findUnique(networkId)
  const token = await getAppToken(userRep.tenantId)
  const spaces = await getSpaces(networkId)
  const space = spaces.find(space => (user.spaceIds == space.id ? space : null))
  const teams = await getListOfTeams(token, userRep.microsoftId)
  const team = teams.find(team => user.teamId == team.value)
  const channels = await getListOfChannels(token, team.value)
  const channel = channels.find(channel => user.channelId == channel.value)
  const spacesMap = spaces.map(space => ({ value: space.id, text: space.name }))
  const spaceMap = { value: space.id, text: space.name }
  console.log('space ', space, 'team ', team, 'channel ', channel)

  return getConnectModalResponse({
    id,
    spaces: spacesMap,
    teams,
    channels,
    editMode: true,
    user: userRep,
    space: spaceMap, // Pass the spaces dictionary to the 'spaces' parameter in getConnectModalResponse
    team: team,
    channel: channel,
  })
}

export const getCallbackResponse = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  logger.debug('getCallbackResponse called', { options })

  const {
    networkId,
    data: { callbackId, interactionId, inputs },
  } = options
  // const formData = inputs; // Retrieve 'formData' from 'inputs'

  // if (callbackId === 'modal_submit') {
  //   return handleModalSubmit(networkId, formData);
  // }
  if (callbackId.includes('edit')) {
    return handleEditBlock(options)
  } else if (callbackId.includes('delete')) {
    return handleDeleteBlock(options)
  } else if (callbackId.includes('removeBlock')) {
    return handleDeleteBlockSure(options)
  } else if (callbackId.includes('updateBlock')) {
    return handleUpdateButtonClick(options)
  } else if (callbackId.includes('upgrade')) {
    return getFetchChannelsCallbackResponseUpgrade(options)
  }
  switch (callbackId) {
    case SettingsBlockCallback.AuthVoke:
      return getAuthRevokeCallbackResponse(options)
    case SettingsBlockCallback.OpenModal:
      return getOpenModalCallbackResponse(options)
    case SettingsBlockCallback.SaveModal:
      return handleSaveButtonClick(options)
    case SettingsBlockCallback.FetchChannels: // Handle the "fetch_channels" callback ID
      return getFetchChannelsCallbackResponse(options)
    case SettingsBlockCallback.AuthRedirect:
      // return getRedirectCallbackResponse(options)
      return getAuthRedirectCallbackResponse(options)

    default:
      return getInteractionNotSupportedError('callbackId', callbackId)
  }
}
