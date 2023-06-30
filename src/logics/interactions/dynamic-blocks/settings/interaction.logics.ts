import { InteractionType, ToastStatus, WebhookStatus, WebhookType } from '@enums'
import {
  InteractionInput,
  InteractionWebhook,
  InteractionWebhookResponse,
} from '@interfaces'
import { NetworkSettings } from '@prisma/client'
import { NetworkRepository } from '@repositories'
import { PermissionContext } from '@tribeplatform/gql-client/types'

import { getInteractionNotSupportedError } from '../../../error.logics'

import { globalLogger } from '@utils'
import { getCallbackResponse } from './callback.logics'
import { getNetworkSettingsSlate } from './slate.logics'
import { getDisconnectedSettingsResponse } from './helper'

const logger = globalLogger.setContext(`SettingsDynamicBlock`)

const getNetworkSettingsInteractionResponse = async (options: {
  networkId: string
  data: InteractionInput<NetworkSettings>
}): Promise<InteractionWebhookResponse> => {
  logger.debug('getNetworkSettingsInteractionResponse called', { options })

  const {
    networkId,
    data: { interactionId, callbackId },
  } = options

  const network = await NetworkRepository.findUnique(networkId)
  console.log(network)
  
  if (callbackId) {
    return getCallbackResponse({ networkId, data: options.data })
  }
  if (!network) {
    return getDisconnectedSettingsResponse({
      interactionId,
    })
  }
  return {
    type: WebhookType.Interaction,
    status: WebhookStatus.Succeeded,
    data: {
      interactions: [
        {
          id: interactionId,
          type: InteractionType.Show,
          slate: await getNetworkSettingsSlate(network.settings),
        },
      ],
    },
  }
}

export const getSettingsInteractionResponse = async (
  webhook: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  logger.debug('getSettingsInteractionResponse called', { webhook })

  const { networkId, context, data } = webhook

  switch (context) {
    case PermissionContext.NETWORK:
      return getNetworkSettingsInteractionResponse({
        networkId,
        data: data as InteractionInput<NetworkSettings>,
      })
    default:
      return getInteractionNotSupportedError('context', context)
  }
}
