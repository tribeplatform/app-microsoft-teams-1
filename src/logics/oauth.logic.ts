import * as msal from '@azure/msal-node'
import { MICROSOFT_AAD_ENDPOINT, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_ENDPOINT, SERVER_URL } from '@config'
import { MicrosoftAuthInfo, MicrosoftState } from '@interfaces'
import { NetworkRepository } from '@repositories'
import { Network } from '@tribeplatform/gql-client/types'
import { signJwt } from '@utils'
import axios from 'axios'
import { tokenRequest } from './microsoft/authConfig'







export const connectToMicrosoft = async (options: {
  authInfo: MicrosoftAuthInfo
  state: MicrosoftState
}) => {
  const { authInfo, state } = options
  const { networkId, actorId } = state
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    profile: { microsoft_domain, microsoft_id, user_id },
    accessToken: token,
    refreshToken: refresh,
  } = authInfo
  await NetworkRepository.upsert(networkId, {
      memberId: actorId,
      userId: String(user_id),
      refresh: refresh,
      token: token,
      microsoftId: String(microsoft_id),
      name: '',
  })
}

export const getConnectMicrosoftUrl = async (options: {
  network: Network
  actorId: string
}) => {
  const { network, actorId } = options
  return `${SERVER_URL}/oauth?jwt=${await signJwt({
    networkId: network.id,
    actorId,
    redirectUrl: "https://internship2023.bettermode.io/manage/apps/microsoft-teams",
  })}`
}

export const getTenantId = async (token, endpoint) => {
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  console.log('request made to Graph API at: ' + new Date().toString())
  try {
    const response = await axios.get(endpoint, options)
    return await response.data.value[0].id
  } catch (error) {
    throw new Error(error)
  }
  
}


export const getAppToken = async (token) =>  {
  const tokenRequest = {
    scopes: [
      MICROSOFT_ENDPOINT + '.default'], // e.g. ‘https://graph.microsoft.com/.default’
  };
  const tenantId = await getTenantId(token, MICROSOFT_ENDPOINT+"v1.0/organization")
  const msalConfig = {
    auth: {
      clientId: MICROSOFT_CLIENT_ID,
      authority: MICROSOFT_AAD_ENDPOINT + tenantId,
      clientSecret: MICROSOFT_CLIENT_SECRET,
    }
  };
  const cilentCLientMicrosoft = new msal.ConfidentialClientApplication(msalConfig);
  const applicationAccessTokedn = await cilentCLientMicrosoft.acquireTokenByClientCredential(tokenRequest);
  console.log(applicationAccessTokedn ,"secondToken")
  return applicationAccessTokedn.accessToken
}

