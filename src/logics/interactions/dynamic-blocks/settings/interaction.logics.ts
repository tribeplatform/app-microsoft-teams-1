import { ChannelRepository } from '@/repositories/channel.repository'
import { InteractionWebhook, InteractionWebhookResponse } from '@interfaces'
import { NetworkRepository } from '@repositories'
import { PermissionContext } from '@tribeplatform/gql-client/types'
import { globalLogger } from '@utils'
import { getInteractionNotSupportedError } from '../../../error.logics'
import { getCallbackResponse } from './callback.logics'
import {
  getConnectedSettingsResponse,
  getDisconnectedSettingsResponse,
  withDetails,
} from './helper'

const logger = globalLogger.setContext(`SettingsDynamicBlock`)

export const getNetworkSettingsInteractionResponse = async (
  options: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  logger.debug('getNetworkSettingsInteractionResponse called', { options })
  const {
    networkId,
    data: { interactionId, callbackId },
  } = options
  if (callbackId) {
    return getCallbackResponse(options)
  }

  const network = await NetworkRepository.findUnique(networkId)
  const info = await ChannelRepository.findMany()

  if (!network) {
    return getDisconnectedSettingsResponse({
      interactionId,
    })
  }
  if (info.length > 0) {
    return withDetails(options, network)
  }
  if (network) {
    return getConnectedSettingsResponse(options.data, network)
  }
}

export const getSettingsInteractionResponse = async (
  webhook: InteractionWebhook,
): Promise<InteractionWebhookResponse> => {
  logger.debug('getSettingsInteractionResponse called', { webhook })

  const { networkId, context, data } = webhook

  switch (context) {
    case PermissionContext.NETWORK:
      return getNetworkSettingsInteractionResponse(webhook)

    default:
      return getInteractionNotSupportedError('context', context)
  }
}
