import { InteractionType, WebhookStatus, WebhookType } from '@enums'
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
import { rawSlateToDto } from '@tribeplatform/slate-kit/utils'
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
import { RevokeModal } from './slates/Revoke-Modal.slate'

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
  } catch (error) {
    logger.error(error)
    // return getServiceUnavailableError(webhook)
  }

  return getDisconnectedSettingsResponse({ interactionId })
}

const getOpenModalRevokeCallbackResponse = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  const { networkId, data } = options

  const slate = RevokeModal()
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
            title: 'Revoke',
          },
          slate: rawSlateToDto(await slate),
        },
      ],
    },
  }
}


const getOpenModalCallbackResponse = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  const { networkId, data } = options
  logger.debug('getConnectCallbackResponse called', { networkId })

  const user = await NetworkRepository.findUnique(networkId)
  const accessToken = user.token

  const spacesList = await getSpaces(networkId)

  const spaces = spacesList.map(space => ({ value: space.id, text: space.name }))

  const teams = await getListOfTeams(
    accessToken,
    user.refresh,
    networkId,
    user.tenantId,
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
  const { teamId, spaceId } = data.inputs.formValues as any // Destructure 'selectedTeamId' and 'selectedSpacesId' from 'inputs'

  // Your code here to fetch the channels for the selected team and space
  try {
    const user = await NetworkRepository.findUnique(networkId)
    console.log("tenant Id:", user.tenantId)
    const accessToken = await getAppToken(user.token, user.networkId, user.tenantId)
    

    const spacesList = await getSpaces(networkId)
    const teams = await getListOfTeams(
      accessToken,
      user.refresh,
      networkId,
      user.tenantId,
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

    const channels = await getListOfChannels(
      accessToken,
      teamId as string,
      user.networkId,
      user.tenantId,
    )
    console.log('Channels:', channels)
    console.log('teams:', teamId)
    console.log('spaces:', spaceId)

    // Now that you have the channels, update the slate with the new items for the channels dropdown
    const updatedModalSlate = getConnectModalSlate({
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

const handleSaveButtonClick = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  const { networkId, data } = options
  const { spaceId: spaces, teamId: teams, channelId } = data.inputs
  console.log('hi', data.inputs)
  try {
    // Save the user's selections in the database, along with other existing fields
    console.log('hi', teams)
    await ChannelRepository.create({
      networkId: networkId as string,
      spaceIds: spaces as string,
      teamId: teams as string,
      channelId: channelId as string,
    })
    // const network = await NetworkRepository.findUnique(networkId)

    const user = await NetworkRepository.findUnique(networkId)
    // return getConnectedSettingsResponse(options.data, network)
    // const updateSlate = getConnectedSettingsSlate2()

    try {
      // await installingBotTeams(networkId, user.token, teams, user.tenantId)
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
  switch (callbackId) {
    case SettingsBlockCallback.RevokeModal:
      return getOpenModalRevokeCallbackResponse(options)
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
