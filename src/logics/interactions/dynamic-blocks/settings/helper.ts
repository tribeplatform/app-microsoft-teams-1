import { InteractionType, ToastStatus, WebhookStatus, WebhookType } from '@enums'
import { InteractionWebhook, InteractionWebhookResponse } from '@interfaces'
import { Network } from '@prisma/client'
import { rawSlateToDto } from '@tribeplatform/slate-kit/utils'

import { ChannelRepository } from '@/repositories/channel.repository'
import { getConnectModalSlate } from './slates/connect-modal.slate'
import { getConnectedSettingsSlate2 } from './slates/connected-channels.slate'
import { getConnectedSettingsSlate } from './slates/connected.slate'
import { getNotConnectedSettingsSlate } from './slates/not-connected.slate'
import { getListOfChannels, getListOfTeams, getSpaces } from './microsoft-info.logic'
import { getAppToken } from '@/logics/oauth.logic'
import { RawBlockDto } from '@tribeplatform/slate-kit/dtos'
import { channelTemplate } from './slates/channel.slate'
// import { getConnectedSettingsSlate } from './slates/connected-settings.slate'

export const getConnectedSettingsResponse = async (
  options: {
    interactionId: string
  },
  user: Network,
): Promise<InteractionWebhookResponse> => {
  const { interactionId } = options

  const slate = await getConnectedSettingsSlate({
    user,
  })
  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: interactionId,
          type: InteractionType.Show,
          slate: rawSlateToDto(slate),
        },
      ],
    },
  }
}

export const getConnectSettingsWithChannelsResponse = async (
  options: InteractionWebhook,
  user: Network,
): Promise<InteractionWebhookResponse> => {
  const { networkId, data } = options
  const { interactionId } = data

  const children = await ChannelRepository.findMany()

  const selectedSpace = children[0].spaceIds
  const selectedteam = children[0].teamId
  const token = await getAppToken(user.tenantId)
  const teams = await getListOfTeams(token, user.microsoftId)
  const spacesList = await getSpaces(user.networkId)
  const spaces = spacesList.map(space => ({ value: space.id, text: space.name }))
  const id = 'adding-teams'
  const channels = await channelMaker({id, children, spaces, token, teams})
  const selectedSpaceText =
  spaces.find(space => space.value === selectedSpace)?.text || ''
  const selectedTeamText = teams.find(team => team.value === selectedteam)?.text || ''

  const slate = getConnectedSettingsSlate2({
    user,
    selectedSpaceText,
    selectedTeamText,
    children,
    channels,
  })
  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: interactionId,
          type: InteractionType.Show,
          slate: rawSlateToDto(await slate),
        },
      ],
    },
  }
}

export const getDisconnectedSettingsResponse = async (options: {
  interactionId: string
}): Promise<InteractionWebhookResponse> => {
  const { interactionId } = options
  const slate = getNotConnectedSettingsSlate()
  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: interactionId,
          type: InteractionType.Show,
          slate: rawSlateToDto(await slate),
        },
      ],
    },
  }
}

export const getConnectModalResponse = async (options: {
  id?: string
  spaces?: object
  teams?: object
  channels?: object
  formCallbackId?: string
  channelCallbackId?: string
  defaultValues?: any
  buttonVariant?: string
  buttonText?: string
  // interactionId: string
}): Promise<InteractionWebhookResponse> => {
  const {
    id,
    spaces,
    teams,
    channels,
    defaultValues,
    formCallbackId,
    channelCallbackId,
    buttonText,
    buttonVariant,
  } = options

  const slate = await getConnectModalSlate({
    channelCallbackId,
    formCallbackId,
    objectId: id,
    buttonText,
    buttonVariant,
    spaces,
    teams,
    channels,
    defaultValues,
  })
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
            title: 'Connect to Microsoft Teams Channels',
          },
          slate: rawSlateToDto(slate),
        },
      ],
    },
  }
}

export const getOpenToastCallbackResponse = (options: {
  networkId: string
  data: {
    interactionId: string
    title: string
    description: string
  }
}): InteractionWebhookResponse => {
  const { networkId, data } = options

  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: data.interactionId,
          type: InteractionType.OpenToast,
          props: {
            status: ToastStatus.Info,
            title: data.title,
            description: data.description,
          },
        },
      ],
    },
  }
}
export const channelMaker = async (options: {
  id
  children
  spaces
  token
  teams
}): Promise<RawBlockDto[]> => {
  const { children, token, id, spaces, teams } = options
  const channelsConnected = []
  for (let i = 0; i < children.length; i++) {
    const selectedSpaceText =
      spaces.find(space => space.value === children[i].spaceIds)?.text || ''
    const selectedTeamText = teams.find(team => team.value === children[i].teamId)
    const channel = await getListOfChannels(token, selectedTeamText.value)
    const selectedChannelText =
      channel.find(channel => channel.value === children[i].channelId)?.text || ''
    const selectedObjectId = children[i].id
    channelsConnected.push(
      await channelTemplate({
        id: id,
        i: i,
        selectedSpaceText: selectedSpaceText,
        selectedTeamText: selectedTeamText,
        selectedObjectId: selectedObjectId,
        selectedChannelText: selectedChannelText,
      }),
    )
  }
  return  [].concat(...channelsConnected)
}
