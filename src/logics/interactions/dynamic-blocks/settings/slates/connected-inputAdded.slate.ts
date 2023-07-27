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
  selectedChannel,
  selectedSpace,
  selectedteam
}): Promise<RawSlateDto> => {
  const {
    user,
    selectedChannel,
    selectedSpace,
    selectedteam

  } = options

  const accessToken = user.token;
  const spacesList = await getSpaces(user.networkId);
  const spaces = spacesList.map(space => ({value: space.id, text: space.name}))

  const teams = await getListOfTeams(accessToken);
  const channels = await getListOfChannels(accessToken, selectedteam);

  // Find the corresponding text for the selectedSpace, selectedTeam, and selectedChannel
  const selectedSpaceText = spaces.find(space => space.value === selectedSpace[0])?.text || '';
  const selectedTeamText = teams.find(team => team.value === selectedteam)?.text || '';
  const selectedChannelText = channels.find(channel => channel.value === selectedChannel)?.text || '';
  console.log("hello: ", spaces)
  console.log("sp: ", selectedSpaceText)
  console.log("team: ", teams)
  console.log('f:', selectedSpace)
  return {
    rootBlock: 'root',
    blocks: [
      {
        id: 'root',
        name: 'Container',
        props: { spacing: 'md' },
        children: ['chanels-integration', 'adding-teams', 'auth'],
      },


    

    ...getAuthSettingsBlocks({
        id: 'adding-teams',
        action: 'Add Teams',
        title: 'Teams channels',
        actionCallbackId: SettingsBlockCallback.OpenModal,
        actionVariant: 'primary',
        // secondaryActionCallbackId: SettingsBlockCallback.OpenConnectModal,
        description: `Space: ${selectedSpaceText}<br>Teams: ${selectedTeamText}<br>Channel: ${selectedChannelText}`,
      }),
      ...getAuthSettingsBlocks({
        id: 'auth',
        action: 'Revoke',
        actionCallbackId: SettingsBlockCallback.AuthVoke,
        actionVariant: 'danger',
        // secondaryActionCallbackId: SettingsBlockCallback.OpenConnectModal,
        description: `Connected by [${user.name}] on ${moment(user.createdAt).format(
          'MMMM Do YYYY, h:mm a',
        )}<br>By revoking access, you will lose your settings and no longer be able to use Microsoft Teams features on Bettermode.`,
      }),
    ],
  }
}