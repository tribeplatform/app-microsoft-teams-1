import { InteractionType, ToastStatus, WebhookStatus, WebhookType } from '@enums'
import { InteractionWebhook, InteractionWebhookResponse } from '@interfaces'
import { Network } from '@prisma/client'
import { rawSlateToDto } from '@tribeplatform/slate-kit/utils'

import { ChannelRepository } from '@/repositories/channel.repository'
import { getConnectModalSlate } from './slates/connect-modal.slate'
import { getConnectedSettingsSlate2 } from './slates/connected-inputAdded.slate'
import { getConnectedSettingsSlate } from './slates/connected.slate'
import { getNotConnectedSettingsSlate } from './slates/not-connected.slate'
import { getListOfChannels, getListOfTeams } from './microsoft-info.logic'
import { getAppToken } from '@/logics/oauth.logic'
// import { getConnectedSettingsSlate } from './slates/connected-settings.slate'

export const getConnectedSettingsResponse = async (options: {
  interactionId: string

  
}, user: Network): Promise<InteractionWebhookResponse> => {
  const {
    interactionId,
  } = options

  
  const slate = getConnectedSettingsSlate({
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


export const withDetails = async (options: InteractionWebhook, user: Network): Promise<InteractionWebhookResponse> => {

    const { networkId, data } = options;
    const {interactionId} = data

    const ch = await ChannelRepository.findMany()
    // [chanle1,chan2]
    // ch[0].channelId

    const selectedChannel = ch[0].channelId
    const selectedSpace = ch[0].spaceIds
    const selectedteam = ch[0].teamId
    const slates = []
    const token = await getAppToken(user.networkId, user.networkId, user.tenantId)
    const teams = await getListOfTeams(token, user.refresh, user.networkId, user.tenantId, user.microsoftId);
    const channels = await getListOfChannels(token, selectedteam,user.networkId, user.tenantId );

  
      const slate = getConnectedSettingsSlate2({
        user,
        selectedChannel,
        selectedSpace,
        selectedteam,
        teams,
        channels,
        ch
      })

    
  // const slate = getConnectedSettingsSlate2({
  //   user,
  //   selectedChannel,
  //   selectedSpace,
  //   selectedteam


   
  // })
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
          slate: rawSlateToDto(slate),
        },
      ],
    },
  }
}



export const getConnectModalResponse = async (options: {
  user: Network
  spaces?: object;
  teams: object
  channels: object
  // interactionId: string

}): Promise<InteractionWebhookResponse> => {
  const {
    spaces,
    teams,
    channels
  } = options


  const slate = getConnectModalSlate({
    spaces,
    teams,
    channels
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
  networkId: string,
  data: {
    interactionId: string
    title: string,
    description: string
  }
}): InteractionWebhookResponse => {
  const { networkId, data } = options;

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
  };
};