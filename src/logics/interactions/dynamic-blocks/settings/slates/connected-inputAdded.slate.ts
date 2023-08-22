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
  selectedChannel,
  selectedSpace,
  selectedteam
  teams,
  channels?
  ch
  token?
}): Promise<RawSlateDto> => {
  const {
    user,
    selectedChannel,
    selectedSpace,
    selectedteam,
    ch,
    teams,
    channels,
    token
  } = options


  const spacesList = await getSpaces(user.networkId);
  const spaces = spacesList.map(space => ({value: space.id, text: space.name}))

 

  // Find the corresponding text for the selectedSpace, selectedTeam, and selectedChannel
  const selectedSpaceText = spaces.find(space => space.value === selectedSpace)?.text || '';
  const selectedTeamText = teams.find(team => team.value === selectedteam)?.text || '';
  // const selectedChannelText = channels.find(channel => channel.value === selectedChannel)?.text || '';
  // const card_content = 
  //   {
  //     children: [],
  //     id: 'all-channels',
  //     name: 'Container',
  //     props: { spacing: 'md' },
  //   }
  // const details = []
  // for (let i = 0; i< ch.length; i++){
  //   const selectedSpaceText = spaces.find(space => space.value === ch[i].spaceIds)?.text || '';
  //   const selectedTeamText = teams.find(team => team.value === ch[i].teamId)?.text || '';
  //   const selectedChannelText = channels.find(channel => channel.value === ch[i].channelId)?.text || '';
  //   details.push({
  //     id: 'details'+i,
  //     name: 'Text',
  //     props: { value: `Space: ${selectedSpaceText}<br>Teams: ${selectedTeamText}<br>Channel: ${selectedChannelText}` },
  //   })
  //   card_content.children.push('details'+i)
  // }
  // console.log('details', details)
  // console.log('card_content', card_content)
  
  return {
    rootBlock: 'root',
    blocks: [
      {
        id: 'root',
        name: 'Container',
        props: { spacing: 'md' },
        children: ['chanels-integration', 'adding-teams', 'auth','channels' ],
      },
      {
        id: 'channels',
        name: 'Card',
        children: ['all-channels',],
      },
    
      
  
    

     ...await getAuthSettingsBlocks({
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
      }),
      ... await getAuthSettingsBlocks({
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