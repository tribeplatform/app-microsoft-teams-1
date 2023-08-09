import { MicrosoftAuthProfile, MicrosoftState } from '@/interfaces/microsoft-teams.interface'
import { verifyJwt } from '@/utils/jwt.utils'
import { MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, SERVER_URL } from '@config'
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

// var MicrosoftStrategy = require('passport-microsoft').Strategy;
// passport.use(new MicrosoftStrategy({
//     // Standard OAuth2 
//     clientID: '568aaefe-81b7-487a-b19a-21c4a96498dc',
//     clientSecret: 'PT48Q~Wby_OkU~LjWpaVMDKoETqzy54lBa0-ec_e',
//     callbackURL: "oauth/redirect",
//     scope: ['user.read'],
  
//     cashe: {},

//     // Microsoft specific options

//     // [Optional] The tenant for the application. Defaults to 'common'. 
//     // Used to construct the authorizationURL and tokenURL
//     tenant: 'common',

//     // [Optional] The authorization URL. Defaults to `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`
//     authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',

//     // [Optional] The token URL. Defaults to `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`
//     tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
//   },
  
//   function (accessToken, refreshToken, profile, done, request: Request,) {
//     // asynchronous verification, for effect...
//     process.nextTick(function () {
  
//       // To keep the example simple, the user's Microsoft Graph profile is returned to
//       // represent the logged-in user. In a typical application, you would want
//       // to associate the Microsoft account with a user record in your database,
//       // and return that user instead.
//       console.log(accessToken,profile)
//       const user: Request['user'] = { accessToken, refreshToken, profile }
//       return done(null,user);
//     });
//   }
// ));

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

export const RefreshTokenClient = (refreshToken) => {

  return refresh.requestNewAccessToken('microsoft', refreshToken, (err, accessToken, refreshToken) => {
    console.log("this is refresed access",accessToken," refresh ", refreshToken)

  })
}
