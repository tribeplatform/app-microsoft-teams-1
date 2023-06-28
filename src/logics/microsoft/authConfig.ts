/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
import * as msal from '@azure/msal-browser'
const testlogin = 'loggedin'
export const msalConfig = {
  auth: {
    // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
    clientId: '568aaefe-81b7-487a-b19a-21c4a96498dc',
    // Full directory URL, in the form of https://login.microsoftonline.com/<tenant-id>
    authority: 'https://login.microsoftonline.com/common',
    clientSecret: 'PT48Q~Wby_OkU~LjWpaVMDKoETqzy54lBa0-ec_e',
    // Full redirect URL, in form of http://localhost:3000
    redirectUri: 'https://hamid.bettermode.ngrok.io/',
    
    
  },
  cache: {},
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case msal.LogLevel.Error:
            console.error(message)
            return
          case msal.LogLevel.Info:
            console.info(message)
            return
          case msal.LogLevel.Verbose:
            console.debug(message)
            return
          case msal.LogLevel.Warning:
            console.warn(message)
            return
        }
      },
    },
  },
}

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
  scopes: ['User.Read', 'Chat.ReadWrite', 'Chat.Create'],
}

/**
 * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const tokenRequest = {
  scopes: ['User.Read', 'Mail.Read','Chat.ReadWrite', 'Chat.Create'],
  forceRefresh: false, // Set this to "true" to skip a cached token and go to the server to get a new token
}
