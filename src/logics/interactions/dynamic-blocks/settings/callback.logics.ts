import { InteractionType, WebhookStatus, WebhookType } from '@enums'
import { InteractionInput, InteractionWebhook, InteractionWebhookResponse, RedirectInteractionProps } from '@interfaces'
import { Network, NetworkSettings } from '@prisma/client'
import { NetworkRepository } from '@repositories'

import { getInteractionNotSupportedError } from '../../../error.logics'

import { globalLogger } from '@utils'
import { SettingsBlockCallback } from './constants'
import { getNetworkSettingsModalSlate, getNetworkSettingsSlate } from './slate.logics'
import { getNetworkClient } from '@clients'
import { getConnectMicrosoftUrl } from '@/logics/oauth.logic'
import { ToastStatus } from '@enums'
import { getDisconnectedSettingsResponse } from './helper'
const logger = globalLogger.setContext(`SettingsDynamicBlock`)

const getSaveCallbackResponse = async (options: {
  network: Network
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => {
  logger.debug('getNetworkSettingsInteractionCallbackResponse called', { options })

  const {
    network,
    data: { interactionId, inputs },
  } = options

  const updatedNetwork = await NetworkRepository.update(network.networkId, {
    settings: inputs,
  })
  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: interactionId,
          type: InteractionType.Show,
          slate: await getNetworkSettingsSlate(updatedNetwork.settings),
        },
      ],
    },
  }
}
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
const getAuthRedirectCallbackResponse = async( options: {
  networkId: string
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => {
  logger.debug('getAuthRedirectCallbackResponse called', { options })
  const {
    networkId,
    data: { actorId },
  } = options
  console.log('networkId2', networkId)
  const gqlClient = await getNetworkClient(networkId)
  console.log('gp', !!gqlClient.query, !!gqlClient.graphqlUrl)
  let network;
  try{
  network = await gqlClient.query({
    name: 'network',
    args: 'basic',
  })
} catch(e){
  console.log(e)
}
  console.log('we are here!', network)
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
const getAuthRevokeCallbackResponse = async (options: {
  networkId: string
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => {
  logger.debug('getAuthRedirectCallbackResponse called', )
  logger.debug('handleUninstalledWebhook called',)
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
const getModalSaveCallbackResponse = async (options: {
  network: Network
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => {
  logger.debug('getNetworkSettingsInteractionCallbackResponse called', { options })

  const {
    network,
    data: { interactionId, inputs, dynamicBlockKey },
  } = options

  await NetworkRepository.update(network.networkId, {
    settings: inputs,
  })
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
          id: 'reload',
          type: InteractionType.Reload,
          props: {
            dynamicBlockKeys: [dynamicBlockKey],
          },
        },
      ],
    },
  }
}

const getOpenModalCallbackResponse = async (options: {
  network: Network
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => ({
  type: WebhookType.Interaction,
  status: WebhookStatus.Succeeded,
  data: {
    interactions: [
      {
        id: options.data.interactionId,
        type: InteractionType.OpenModal,
        slate: await getNetworkSettingsModalSlate(options.network.settings),
        props: {
          size: 'lg',
          title: 'Update configs',
          description: 'Update your configs by changing the values below',
        },
      },
    ],
  },
})

const getOpenToastCallbackResponse = async (options: {
  network: Network
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => ({
  type: WebhookType.Interaction,
  status: WebhookStatus.Succeeded,
  data: {
    interactions: [
      {
        id: 'open-toast',
        type: InteractionType.OpenToast,
        props: {
          status: ToastStatus.Info,
          title:
            options.network.settings?.toastMessage || 'Please set your toast message!',
          description: 'Description goes here',
        },
      },
    ],
  },
})

const getRedirectCallbackResponse = async (options: {
  network: Network
  data: InteractionInput<NetworkSettings>
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



export const getCallbackResponse = async (options: {
  networkId: string
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => {
  logger.debug('getCallbackResponse called', { options })

  const {
    data: { callbackId },
  } = options

  switch (callbackId) {
    // case SettingsBlockCallback.AuthRedirect:
    //   return getAuthRedirectCallbackResponse(options)
    case SettingsBlockCallback.AuthVoke:
      return getAuthRevokeCallbackResponse(options)
    // case SettingsBlockCallback.Save:
    //   return getSaveCallbackResponse(options)
    // case SettingsBlockCallback.ModalSave:
    //   return getModalSaveCallbackResponse(options)
    // case SettingsBlockCallback.OpenModal:
    //   return getOpenModalCallbackResponse(options)
    // case SettingsBlockCallback.OpenToast:
    //   return getOpenToastCallbackResponse(options)
    case SettingsBlockCallback.AuthRedirect:
      // return getRedirectCallbackResponse(options)
      return getAuthRedirectCallbackResponse(options)
    default:
      return getInteractionNotSupportedError('callbackId', callbackId)
  }
}

