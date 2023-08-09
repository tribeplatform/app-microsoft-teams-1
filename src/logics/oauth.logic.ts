import * as msal from '@azure/msal-node'
import { BOT_ID, MICROSOFT_AAD_ENDPOINT, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_ENDPOINT, SERVER_URL } from '@config'
import { MicrosoftAuthInfo, MicrosoftState } from '@interfaces'
import { NetworkRepository } from '@repositories'
import { Network } from '@tribeplatform/gql-client/types'
import { signJwt } from '@utils'
import axios from 'axios'
import { tokenRequest } from './microsoft/authConfig'
import { RefreshTokenClient } from '@middlewares'
import { token } from 'morgan'







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
      name: 'user',
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
    redirectUrl: "https://internship2023.bettermode.io/manage/apps/microsoft-plugin-dev",
  })}`
}

export const getTenantId = async (token, endpoint,networkId) => {
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
    RefreshTokenClient(token, networkId)
  }
  
}


export const getAppToken = async (token, networkId) =>  {
  const tokenRequest = {
    scopes: [
      MICROSOFT_ENDPOINT + '.default'], // e.g. ‘https://graph.microsoft.com/.default’
  };
  const tenantId = await getTenantId(token, MICROSOFT_ENDPOINT+"v1.0/organization", networkId)
  const msalConfig = {
    auth: {
      clientId: MICROSOFT_CLIENT_ID,
      authority: MICROSOFT_AAD_ENDPOINT + tenantId,
      clientSecret: MICROSOFT_CLIENT_SECRET,
    }
  };
  const cilentCLientMicrosoft = new msal.ConfidentialClientApplication(msalConfig);
  const applicationAccessTokedn = await cilentCLientMicrosoft.acquireTokenByClientCredential(tokenRequest);
  console.log(applicationAccessTokedn ,"app token")
  return applicationAccessTokedn.accessToken
}

export const installingBotTeams = async (networkId, token, teamId) => {
  console.log("token bot", await getAppToken(token, networkId))
  console.log("installing bot")
  const options = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAppToken(token, networkId)}`,
    }
  }
  const data = {
    "teamsApp@odata.bind": `https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/${BOT_ID}`
  };
  const endpoint = MICROSOFT_ENDPOINT+"v1.0/teams/"+teamId+"/installedApps"
  console.log(endpoint)
  
    const response = await axios.post(endpoint,data, options)
    console.log("installing status",response.status)



}
export const sendProactiveMessage = async (message: string, channels: string[]) => {
  const options = {
    
      "message": message,
      "channels": channels
    
  }
  const endpoint = "http://localhost:3978/api/notification"
  try {
    const response = await axios.post(endpoint, options)
    console.log("message status",response.status)
  } catch (error) {
    console.log(error)
  } 

}
