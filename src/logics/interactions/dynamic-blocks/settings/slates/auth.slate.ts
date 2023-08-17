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
    channels,
    childern,
    id,
    title,
    description,
    action,
    actionVariant,
    actionCallbackId,
    secondaryAction,
    secondaryActionCallbackId,
  } = options

  const card_content = 
  {
    id: `${id}.content`,
    name: 'Card.Content',
    children: [`${id}.container`,`${id}.rightContainer`],
  }
  // {
    
  //     id: `${id}.container`,
  //     name: 'Container',
  //     props: {
  //       spacing: 'md',
  //       direction: 'horizontal',
  //     },
  //     children: [`${id}.leftContainer`, `${id}.rightContainer`],
  //   }
  //   {
    
  //     id: `${id}.leftContainer`,
  //     name: 'Container',
  //     props: { alignment: { vertical: 'center' } },
  //     children: [],
    
  // }


const details = []
const length = childern?.length || 0
if(childern){
for (let i = 0; i< childern.length; i++){
  const selectedSpaceText = spaces.find(space => space.value === childern[i].spaceIds)?.text || '';
  const selectedTeamText = teams.find(team => team.value === childern[i].teamId);
  console.log('selectedchannel', childern[i].channelId)
  const channel = await getListOfChannels(token, selectedTeamText.value );

  const selectedChannelText = channel.find(channel => channel.value === childern[i].channelId)?.text || '';
  const selectedObjectId = childern[i].id
  details.push(
    {
      id: id+'.'+i+'container',
      name: 'Container',
      props: { padding:"xs", direction: 'horizontal' },
      children: [id+'.'+i+'description', 'edit-button'+i, 'delete-button'+i],
    },
    {
    id: id+'.'+i+'description',
    name: 'Text',
    props: { value: `Space: ${selectedSpaceText}<br>Teams: ${selectedTeamText.text}<br>Channel: ${selectedChannelText}`, format: 'markdown' },
    
  },
  {
    id: 'edit-button'+i,
    name: 'Button',
    props: {  variant: 'secondary', callbackId: 'edit-'+selectedObjectId, text:'Edit' },
    children: ['buttonEdit'+i]
  },
  {
    id: 'buttonEdit'+i,
    name: 'Text',
    props: { value: 'edit' },
  },
  {
    id: 'delete-button'+i,
    name: 'Button',
    props: {  variant: 'danger', callbackId: 'delete-'+selectedObjectId, text: "Delete"},
    children: ['buttonDelete'+i]
    
  },
  {
    id: 'buttonDelete'+i,
    name: 'Text',
    props: { value: 'Delete' },
  },
 
 
//   {
        
//     "children": ["generate-button-text"],
//     "id": "generate",
//     "name": "Button",
//     "props": {
//       size: 'small',
//         "callbackId":"generate",
//         "variant":"primary"
//     }
// },
// {
    
//     "children": [],
//     "id": "generate-button-text",
//     "name": "Icon",
//     "props": {
//         "value":"Generate API Key"
//     }
// }
  )
  card_content.children.push(id+'.'+i+'container')
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
console.log('details', details)
console.log('card_content', card_content)
  
  // for (const child of childern) {
  //   blocks.push({})
  // }
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
        alignment: { vertical: 'center', horizontal: 'right' },
        shrink: false,
      },
      children: [`${id}.action`, ...(secondaryAction ? [`${id}.secondaryAction`] : [])],
    },
    {
      id: `${id}.action`,
      name: (length>=3)?"Alert":'Button',
      props:(length>=3) ? {
        "status":"warning",
        "title": "you have reached the max!",
      } :{ variant: actionVariant, callbackId: actionCallbackId, text:action },
    },
    ...(secondaryAction
      ? [
          {
            id: `${id}.secondaryAction`,
            name: 'Button',
            props: {
              variant: 'basic',
              callbackId: secondaryActionCallbackId,
              text: secondaryAction,
            },
          },
        ]
      : []),
  ]
}
