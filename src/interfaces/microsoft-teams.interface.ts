export interface MicrosoftAuthProfile {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    app_id: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    microsoft_domain: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    microsoft_id: number
  
    token: string
  
    refresh: string
    user: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    user_id: number
  }
  
  export interface MicrosoftAuthInfo {
    profile: MicrosoftAuthProfile
    refreshToken: string
    accessToken: string
  }
  
  export interface MicrosoftState {
    networkId: string
    actorId: string
    redirectUrl: string
  }
  
  declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
      export interface Request {
        state?: MicrosoftState
        consumerKey?: string
        consumerSecret?: string
        user?: MicrosoftAuthInfo
      }
    }
  }