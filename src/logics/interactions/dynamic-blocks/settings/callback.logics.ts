import { InteractionType, WebhookStatus, WebhookType } from '@enums'
import { InteractionInput, InteractionWebhook, InteractionWebhookResponse, RedirectInteractionProps } from '@interfaces'
import { Network } from '@prisma/client'
import { NetworkRepository } from '@repositories'

import { getConnectMicrosoftUrl } from '@/logics/oauth.logic'
import { getNetworkClient } from '@clients'
import { rawSlateToDto } from '@tribeplatform/slate-kit/utils'
import { globalLogger } from '@utils'
import { getInteractionNotSupportedError } from '../../../error.logics'
import { SettingsBlockCallback } from './constants'
import { getConnectModalResponse, getDisconnectedSettingsResponse, getOpenToastCallbackResponse } from './helper'
import { getListOfChannels, getListOfTeams, getSpaces } from './microsoft-info.logic'
import { getConnectModalSlate } from './slates/connect-modal.slate'
import { connectedAddedDetails } from './slates/connected-inputAdded.slate'



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
const getAuthRedirectCallbackResponse = async( options: InteractionWebhook): Promise<InteractionWebhookResponse> => {
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
const getAuthRevokeCallbackResponse = async (options: InteractionWebhook): Promise<InteractionWebhookResponse> => {
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


const getOpenModalCallbackResponse = async (options: InteractionWebhook): Promise<InteractionWebhookResponse> => {
  const { networkId, data } = options;
  // const {interactionId} = data
  logger.debug('getConnectCallbackResponse called', { networkId })

  const user = await NetworkRepository.findUnique(networkId)
  const accessToken = user.token 
  // const teamId = 'c8033bf0-268a-4ff2-8968-81e9b799fc82'
  // const channels = await getListOfChannels(accessToken, teamId)
  const spaces = await getSpaces(networkId)
  const teams = await getListOfTeams(accessToken);
  console.log('Spaces:', spaces)
  console.log('teams:', teams)
  // console.log('channels:', channels)

  return getConnectModalResponse({
    user: await NetworkRepository.findUniqueOrThrow(networkId),
    spaces: spaces, // Pass the spaces dictionary to the 'spaces' parameter in getConnectModalResponse
    teams: teams,
    channels: []
    // interactionId: interactionId

  });
}





const getFetchChannelsCallbackResponse = async (options: InteractionWebhook): Promise<InteractionWebhookResponse> => {
  const { networkId, data } = options;
  const { teamId } = data.inputs.formValues as any // Destructure 'selectedTeamId' and 'selectedSpacesId' from 'inputs'

  // Your code here to fetch the channels for the selected team and space
  try {
    const user = await NetworkRepository.findUnique(networkId);
    const accessToken = user.token;
  
    // Fetch the list of channels for the selected team using 'selectedTeamId' and 'accessToken'
    // const spaces = await getSpaces
    const channels = await getListOfChannels(accessToken, teamId as string);
    console.log('Channels:', channels);

    // Now that you have the channels, update the slate with the new items for the channels dropdown
    const updatedModalSlate = getConnectModalSlate({
      spaces: [],
      teams: {},
      channels: channels,
      
    });
    console.log(JSON.stringify({
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
    }))
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
    };

  } catch (error) {
    console.error('Error fetching channels:');
    // Handle the error in some way, e.g., show an error toast to the user
    return getOpenToastCallbackResponse({
      networkId: networkId,
      data: {
        interactionId: data.interactionId,
        title: 'Error',
        description: 'Error',
      },
    });
  }
};















const handleSaveButtonClick = async (options: InteractionWebhook): Promise<InteractionWebhookResponse> => {
  const { networkId, data } = options;
  const { spaces, teams, channels } = data.inputs;
  const {dynamicBlockKey} = data
  try {
    // Save the user's selections in the database, along with other existing fields
    // await NetworkRepository.update(networkId, {
    //   selectedSpace: spaces,
    //   selectedTeam: teams,
    //   selectedChannel: channels,
    // });

    // Get the user details from the database
  
    const user = await NetworkRepository.findUnique(networkId);

    // Construct the updated slate with the selected details
    const updatedSlate = connectedAddedDetails({
      user,
      selectedSpace: spaces as string,
      selectedTeam: teams as string,
      selectedChannel: channels as string,
    });
  
    // Return the updated slate to show the selected details
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
            id: 'data.interactionId',
            type: InteractionType.Reload,
            // slate: rawSlateToDto(updatedSlate),
            props: {
              dynamicBlockKeys: [dynamicBlockKey]
            }
          },
        ],
      },
    };

  } catch (error) {
    console.error('Error saving data:', error);
    // Handle the error in some way, e.g., show an error toast to the user
    return getOpenToastCallbackResponse({
      networkId: networkId,
      data: {
        interactionId: data.interactionId,
        title: 'Error',
        description: 'Error saving data',
      },
    });
  }
};



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



export const getCallbackResponse = async (options: InteractionWebhook): Promise<InteractionWebhookResponse> => {
  logger.debug('getCallbackResponse called', { options })

  const {
    networkId,
    data: { callbackId, interactionId, inputs },
  } = options;
  // const formData = inputs; // Retrieve 'formData' from 'inputs'

  // if (callbackId === 'modal_submit') {
  //   return handleModalSubmit(networkId, formData);
  // }
  switch (callbackId) {

    case SettingsBlockCallback.AuthVoke:
      return getAuthRevokeCallbackResponse(options)
    case SettingsBlockCallback.OpenModal:
        return getOpenModalCallbackResponse(options)
      case SettingsBlockCallback.SaveModal:
        return handleSaveButtonClick(options)
      case SettingsBlockCallback.FetchChannels: // Handle the "fetch_channels" callback ID
      return getFetchChannelsCallbackResponse(options);   
    case SettingsBlockCallback.AuthRedirect:
      // return getRedirectCallbackResponse(options)
      return getAuthRedirectCallbackResponse(options)
    default:
      return getInteractionNotSupportedError('callbackId', callbackId)
  }
}

