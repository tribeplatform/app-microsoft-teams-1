import { MicrosoftAuthProfile, MicrosoftState } from '@/interfaces/microsoft-teams.interface'
import { verifyJwt } from '@/utils/jwt.utils'
import { MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, SERVER_URL } from '@config'
import { NetworkRepository } from '@repositories'
import { Request, Response } from 'express'
import passport from 'passport'
import { Strategy as MicrosoftPassportStrategy } from 'passport-microsoft'
import refresh from 'passport-oauth2-refresh'







const OAUTH_SCOPES = [
  'user.Read',
  'openid',
  'offline_access',
  'Team.ReadBasic.All',
  "Chat.ReadBasic",
  "ChannelSettings.ReadWrite.All",
  "Group.ReadWrite.All"
]
class MicrosofTeamstStrategy extends MicrosoftPassportStrategy {
    _oauth2: any
  
    constructor(options, verify) {
      super(options, verify)
    }
  
    public authenticate(req: Request, options) {
      return super.authenticate(req, { ...options, state: req.query.jwt })
    }
  }
  
  passport.serializeUser((user, done) => {
    done(null, user)
  })
  
  passport.deserializeUser((user, done) => {
    done(null, user)
  })

  passport.use(
    new MicrosofTeamstStrategy(
      {
        clientID: MICROSOFT_CLIENT_ID,
        clientSecret: MICROSOFT_CLIENT_SECRET,
        scope: OAUTH_SCOPES,
        callbackURL: `${SERVER_URL}/oauth/redirect`,
        passReqToCallback: true,
      },
      async function verify(
        request: Request,
        accessToken: string,
        refreshToken: string,
        profile: MicrosoftAuthProfile,
        done,
      ) {
        const user: Request['user'] = { accessToken, refreshToken, profile }
        return done(null, user)
      },
    ),
  )


export const middleMicrosoft = passport.authenticate('microsoft');

export const consumerExtractorMiddleware = async (req: Request, res: Response, next) => {
  const state = await verifyJwt<MicrosoftState>(
    (req.query.jwt || req.query.state) as string,
  )
  // const community = await NetworkSettingsRepository.findUniqueOrThrow(state.networkId)
  console.log(state)
  req.state = state
  // req.consumerKey = community.newConsumerKey
  // req.consumerSecret = community.newConsumerSecret

  next()
}

export const RefreshTokenClient = (refreshToken,networkId) => {

  return refresh.requestNewAccessToken('microsoft', refreshToken, async (err, accessToken, refreshToken) => {
    console.log("this is refresed access",accessToken," refresh ", refreshToken)
    await NetworkRepository.update(networkId, {
      refresh: refreshToken,
      token: accessToken,
    })

  })
}



