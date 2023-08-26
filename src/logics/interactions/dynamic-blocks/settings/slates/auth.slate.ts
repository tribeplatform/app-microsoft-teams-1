import { RawBlockDto } from '@tribeplatform/slate-kit/dtos'

import { SettingsBlockCallback } from '../constants'
import { title } from 'process'
import { getListOfChannels } from '../microsoft-info.logic'
export const getAuthSettingsBlocks = async (options: {
  childern?: any
  id: string
  description: string
  action: string
  title?: string
  spaces?,
  teams?,
  channels?,
  token?,
  actionVariant: 'outline' | 'primary' | 'danger'
  actionCallbackId: SettingsBlockCallback
  secondaryAction?: string
  secondaryActionCallbackId?: SettingsBlockCallback
}): Promise<RawBlockDto[]> => {
  
  const {
    token,
    spaces,
    teams,
    childern,
    id,
    title,
    description,
    action,
    actionVariant,
    actionCallbackId,
  } = options

  const card_content = 
  {
    id: `${id}.content`,
    name: 'Container',
    props: { direction: 'vertical-reverse', padding : 'xs' },
    children: [`${id}.container`,`${id}.rightContainer`],
  }
const details = []
const length = childern?.length || 0
if(childern){
for (let i = 0; i< childern.length; i++){
  const selectedSpaceText = spaces.find(space => space.value === childern[i].spaceIds)?.text || '';
  const selectedTeamText = teams.find(team => team.value === childern[i].teamId);
  const channel = await getListOfChannels(token, selectedTeamText.value );
  const selectedChannelText = channel.find(channel => channel.value === childern[i].channelId)?.text || '';
  const selectedObjectId = childern[i].id
  details.push(
    {
      id: `${id}.${i}.container`,
      name: 'Container',
      props: { direction: 'horizontal',size:'full', className:'space-x-20' },
      children: [ `${id}.${i}.button-container`, `${id}.${i}.button-container`],
    },
    {
      id: `${id}.${i}.button-container`,
      name: 'Container',
      props: { direction: 'vertical' ,className:'justify-between' },
      children: [`${id}.${i}.description`],
    },
    {
      id: `${id}.${i}.button-container`,
      name: 'Container',
      props: { direction: ' horizontal ',size:'full' ,className:'justify-between' },
      children: [`edit-button.${i}`, `delete-button.${i}`],
    },
  
    {
    id: `${id}.${i}.description`,
    name: 'Text',
    props: {className:'flex-1' ,value: `Space: ${selectedSpaceText}<br>Teams: ${selectedTeamText.text}<br>Channel: ${selectedChannelText}`, format: 'markdown' },
    
  },
  {
    id: `edit-button.${i}`,
    name: 'Button',
    props: {  variant: 'secondary', callbackId: `edit-${selectedObjectId}`, text:'Edit' },
    children: []
  },
  {
    id: `delete-button.${i}`,
    name: 'Button',
    props: {  variant: 'danger', callbackId: `delete-${selectedObjectId}`, text: "Delete"},
    children: []
    
  },

  )
  card_content.children.push(`${id}.${i}.container`)
}

}else{
  const blocks =   {
    id: `${id}.description`,
    name: 'Text',
    props: {
      value: description,
      format: 'markdown',
    },
  }
  details.push(blocks)
  card_content.children.push(`${id}.description`)
}
  return [
    {
      id,
      name: 'Card',
      children: [`${id}.header`, `${id}.content`],
    },
    {
      id: `${id}.header`,
      name: 'Card.Header',
      props: { title: title || 'Your authorization' },
    },
    card_content,
    ...details,

    {
      id: `${id}.rightContainer`,
      name: 'Container',
      props: {
        direction: 'horizontal-reverse',
        spacing: 'xs',
        alignment: {  horizontal: 'right' },
        shrink: false,
      },
      children: [`${id}.action`],
    },
    {
      id: `${id}.action`,
      name: (length>=3)?"Alert":'Button',
      props:(length>=3) ? {
        "status":"warning",
        "title": "you have reached the max!",
      } :{ variant: actionVariant, callbackId: actionCallbackId, text:action },
    },
    // ...(secondaryAction
    //   ? [
    //       {
    //         id: `${id}.secondaryAction`,
    //         name: 'Button',
    //         props: {
    //           variant: 'basic',
    //           callbackId: secondaryActionCallbackId,
    //           text: secondaryAction,
    //         },
    //       },
    //     ]
    //   : []),
  ]
}
