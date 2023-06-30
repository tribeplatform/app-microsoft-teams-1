import { SERVER_URL } from '@config'
import { MicrosoftAuthInfo, MicrosoftState } from '@interfaces'
import { NetworkRepository } from '@repositories'
import { Network } from '@tribeplatform/gql-client/types'
import { signJwt } from '@utils'

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
      refresh: '',
      token: token,
      microsoftId: String(microsoft_id),
      domain: "microsoft_domain",
      name: '',
      graphqlUrl: ''
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
