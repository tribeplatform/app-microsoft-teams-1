import { InteractionType, ToastStatus, WebhookStatus, WebhookType } from '@enums'
import { InteractionWebhookResponse } from '@interfaces'
import { Network } from '@prisma/client'
import { rawSlateToDto } from '@tribeplatform/slate-kit/utils'

import { Space } from '@tribeplatform/gql-client/types'
import { getConnectModalSlate } from './slates/connect-modal.slate'
import { connectedAddedDetails } from './slates/connected-inputAdded.slate'
import { getConnectedSettingsSlate } from './slates/connected.slate'
import { getNotConnectedSettingsSlate } from './slates/not-connected.slate'
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



export const getConnectedSettingsResponse2 = async (options: {
  user: Network
  selectedSpace: string,
  selectedTeam: string,
  selectedChannel: string
  
},): Promise<InteractionWebhookResponse> => {
  const {
    user,
    selectedSpace,
    selectedTeam,
    selectedChannel
  } = options

  const slate = connectedAddedDetails({
    user,
    selectedSpace,
    selectedTeam,
    selectedChannel
  })
  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: 'interactionId',
          type: InteractionType.Show,
          slate: rawSlateToDto(slate),
        },
      ],
    },
  }
}




// export const getConnectedSettingDetails = async (options: {
//   interactionId: string

  
// }, user: Network): Promise<InteractionWebhookResponse> => {
//   const {
//     interactionId,
//   } = options

//   const slate = connectedAddedDetails({
//     user,
//   })
//   return {
//     type: WebhookType.Interaction,
//     status: WebhookStatus.Succeeded,
//     data: {
//       interactions: [
//         {
//           id: interactionId,
//           type: InteractionType.Show,
//           slate: rawSlateToDto(slate),
//         },
//       ],
//     },
//   }
// }


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
  spaces?: Array<Space>;
  teams: object
  channels: object
  interactionId: string

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
          id: options.interactionId,
          // id: 'connect to channels',
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