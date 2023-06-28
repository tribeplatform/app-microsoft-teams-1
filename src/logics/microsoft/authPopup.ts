// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
import * as msal from '@azure/msal-node'
import { graphConfig } from './graphConfig'
import { callMSGraph, createChat } from './callGraph'
import { msalConfig, loginRequest, tokenRequest } from './authConfig'
import { Redirect } from 'routing-controllers'
import { log } from 'console'
let express = require('express')
const msalInstance = new msal.ConfidentialClientApplication(msalConfig)
const cryptoProvider = new msal.CryptoProvider()
export let loggedin = false
let homeAccountId = null
let verifier_ = ''
const csrfToken = cryptoProvider.createNewGuid()
const state = cryptoProvider.base64Encode(
  JSON.stringify({
    csrfToken: csrfToken,
    redirectTo: '/',
  }),
)
const authCodeUrlRequestParams = {
  state: state,
  ...loginRequest,
}




export async function redirect(req) {
  console.log('redirect')
  const tokenRequest = {
    code: req.query.code,
    codeVerifier: verifier_,
    redirectUri: 'https://hamid.bettermode.ngrok.io/microsoft/redirect',
    ...loginRequest,
  }
  try {
    // console.log(await msalInstance.getTokenCache().getAllAccounts())

    const tokenResponse = await msalInstance.acquireTokenByCode(tokenRequest)
    homeAccountId = tokenResponse.account.homeAccountId
    console.log(tokenResponse.accessToken)
    const response = await callMSGraph(
      graphConfig.graphMeEndpoint,
      tokenResponse.accessToken,
    )
    // homeAccountId = response.account.homeAccountId;
    console.log(homeAccountId + ' account id')
    console.log(response)
    const userId0 = response.id
    const userId1 = '62d295b3b8ff498d'
    const endpoint = 'https://graph.microsoft.com/v1.0/chats'
    loggedin = true

    const chat = await createChat( endpoint, tokenResponse.accessToken, userId0, userId1) 
    console.log(chat)
  } catch (error) {
    console.log(error)
  }
}
export async function getResource() {
  // Find account using homeAccountId or localAccountId built after receiving auth code token response
  const msalTokenCache = msalInstance.getTokenCache()
  console.log(msalTokenCache)
  const account = await msalTokenCache.getAccountByHomeId("00000000-0000-0000-62d2-95b3b8ff498d.9188040d-6c67-4c5b-b112-36a304b66dad")
  console.log(account) // alternativley: await msalTokenCache.getAccountByLocalId(localAccountId) if using localAccountId

  // Build silent request
  const silentRequest = {
    account: account,
    scopes: ['user.read'],
  }
  // Acquire Token Silently to be used in Resource API calll
  msalInstance
    .acquireTokenSilent(silentRequest)
    .then(response => {
      // Handle successful resource API response
      console.log(response)
    })
    .catch(error => {
      // Handle resource API request error
      console.log(error)
    })
}

export async function signIn() {
  /**
   * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
   */
  console.log('sign in')

  const { verifier, challenge } = await cryptoProvider.generatePkceCodes()
  const pkceCodes = { challengeMethod: 'S256', verifier: verifier, challenge: challenge }
  verifier_ = verifier
  const authCodeUrlRequest = {
    redirectUri: 'https://hamid.bettermode.ngrok.io/microsoft/redirect',
    // recommended for confidential clients
    codeChallenge: pkceCodes.challenge,
    codeChallengeMethod: pkceCodes.challengeMethod,
    ...authCodeUrlRequestParams,
  }


  const authCodeUrl = await msalInstance.getAuthCodeUrl(authCodeUrlRequest)
  console.log(authCodeUrl)

  return authCodeUrl

  //   myMSALObj
  //     .loginPopup(loginRequest)
  //     .then(handleResponse)
  //     .catch(error => {
  //       console.error(error)
  //     })
}

export function signOut() {
  /**
   * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
   */
  //   const logoutRequest = {
  //     account: myMSALObj.getAccountByUsername(username),
  //     postLogoutRedirectUri: msalConfig.auth.redirectUri,
  //     mainWindowRedirectUri: msalConfig.auth.redirectUri,
  //   }
  //   myMSALObj.logoutPopup(logoutRequest)
  
  const logoutUri = `${msalConfig.auth.authority}/oauth2/v2.0/logout?post_logout_redirect_uri=${msalConfig.auth.redirectUri}`;
  console.log(logoutUri)
  loggedin = false
  return logoutUri
  
}


