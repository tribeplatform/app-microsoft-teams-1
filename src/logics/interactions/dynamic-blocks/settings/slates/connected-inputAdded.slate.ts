// import { SalesforceCommunity, SalesforceUser } from '@interfaces'
import { Network } from '@prisma/client'
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos'
import moment from 'moment'

import { SettingsBlockCallback } from '../constants'

import { getListOfChannels, getListOfTeams, getSpaces } from '../microsoft-info.logic'
import { getAuthSettingsBlocks } from './auth.slate'
// import { getChanelIntegrationBlocks } from './chanel-integration.slate'

export const getConnectedSettingsSlate2 = async (options: {
  user: Network
  arryChannel?: string[]
  selectedChannel
  selectedSpace
  selectedteam
  teams
  channels?
  ch
  token?
}): Promise<RawSlateDto> => {
  const { user, selectedSpace, selectedteam, ch, teams, channels, token } = options

  const spacesList = await getSpaces(user.networkId)
  const spaces = spacesList.map(space => ({ value: space.id, text: space.name }))
  const selectedSpaceText =
    spaces.find(space => space.value === selectedSpace)?.text || ''
  const selectedTeamText = teams.find(team => team.value === selectedteam)?.text || ''

  return {
    rootBlock: 'root',
    blocks: [
      {
        id: 'root',
        name: 'Container',
        props: { spacing: 'md' },
        children: ['chanels-integration', 'adding-teams', 'auth', 'channels'],
      },
      {
        id: 'channels',
        name: 'Card',
        children: ['all-channels', 'icontest'],
      },
      {
        id: 'icontest',
        name: 'Image',
        props: {   url:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 448 512'%3E%3C!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --%3E%3Cpath d='M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z'/%3E%3C/svg%3E",
      },
    },

      ...(await getAuthSettingsBlocks({
        teams,
        channels,
        spaces,
        token,
        childern: ch,
        id: 'adding-teams',
        action: 'Add Teams',
        title: 'Teams channels',
        actionCallbackId: SettingsBlockCallback.OpenModal,
        actionVariant: 'primary',
        // secondaryActionCallbackId: SettingsBlockCallback.OpenConnectModal,
        description: `Space: ${selectedSpaceText}<br>Teams: ${selectedTeamText}<br>Channel: `,
      })),
      ...(await getAuthSettingsBlocks({
        id: 'auth',
        action: 'Revoke',
        actionCallbackId: SettingsBlockCallback.AuthVoke,
        actionVariant: 'danger',
        // secondaryActionCallbackId: SettingsBlockCallback.OpenConnectModal,
        description: `Connected on ${moment(user.createdAt).format(
          'MMMM Do YYYY, h:mm a',
        )}<br>By revoking access, you will lose your settings and no longer be able to use Microsoft Teams features on Bettermode.`,
      })),
    ],
  }
}
