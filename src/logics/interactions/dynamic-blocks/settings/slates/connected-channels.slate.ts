// import { SalesforceCommunity, SalesforceUser } from '@interfaces'
import { Network } from '@prisma/client'
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos'
import moment from 'moment'
import { SettingsBlockCallback } from '../constants'
import { getAuthSettingsBlocks } from './auth.slate'
export const getConnectedSettingsSlate2 = async (options: {
  user: Network
  selectedSpaceText
  selectedTeamText
  channels?
  children?
}): Promise<RawSlateDto> => {
  const { user, selectedSpaceText, selectedTeamText, children, channels } = options
  return {
    rootBlock: 'root',
    blocks: [
      {
        id: 'root',
        name: 'Container',
        props: { spacing: 'md' },
        children: ['chanels-integration', 'adding-teams', 'auth', 'channels'],
      },
      ...getAuthSettingsBlocks({
        channels,
        children,
        id: 'adding-teams',
        action: 'Add Teams',
        title: 'Teams channels',
        actionCallbackId: SettingsBlockCallback.OpenModal,
        actionVariant: 'primary',
        description: `Space: ${selectedSpaceText}<br>Teams: ${selectedTeamText}<br>Channel: `,
      }),
      ...getAuthSettingsBlocks({
        id: 'auth',
        action: 'Revoke',
        actionCallbackId: SettingsBlockCallback.AuthVoke,
        actionVariant: 'danger',
        // secondaryActionCallbackId: SettingsBlockCallback.OpenConnectModal,
        description: `Connected on ${moment(user.createdAt).format(
          'MMMM Do YYYY, h:mm a',
        )}<br>By revoking access, you will lose your settings and no longer be able to use Microsoft Teams features on Bettermode.`,
      }),
    ],
  }
}
