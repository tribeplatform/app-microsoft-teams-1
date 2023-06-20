/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
import * as msal from '@azure/msal-browser'

export const msalConfig = {
  auth: {
    // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
    clientId: '5ba4291c-c5c5-44cd-8e7d-7073250eb41f',
    // Full directory URL, in the form of https://login.microsoftonline.com/<tenant-id>
    authority: 'https://login.microsoftonline.com/consumers',
    clientSecret: 'JAl8Q~RpCwL6Ee4A9P_B-AMmUZHdhCIN9f6N2bs~',
    // Full redirect URL, in form of http://localhost:3000
    redirectUri: 'https://hamid.bettermode.ngrok.io/',
    
  },
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
  scopes: ['User.Read'],
}

/**
 * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const tokenRequest = {
  scopes: ['User.Read', 'Mail.Read'],
  forceRefresh: false, // Set this to "true" to skip a cached token and go to the server to get a new token
}
