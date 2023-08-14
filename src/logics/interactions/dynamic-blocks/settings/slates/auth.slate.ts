import { RawBlockDto } from '@tribeplatform/slate-kit/dtos'

import { SettingsBlockCallback } from '../constants'
import { title } from 'process'
export const getAuthSettingsBlocks = (options: {
  childern?: any
  id: string
  description: string
  action: string
  title?: string
  spaces?,
  teams?,
  channels?,

  actionVariant: 'outline' | 'primary' | 'danger'
  actionCallbackId: SettingsBlockCallback
  secondaryAction?: string
  secondaryActionCallbackId?: SettingsBlockCallback
}): RawBlockDto[] => {
  
  const {
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
if(childern){
for (let i = 0; i< childern.length; i++){
  const selectedSpaceText = spaces.find(space => space.value === childern[i].spaceIds)?.text || '';
  const selectedTeamText = teams.find(team => team.value === childern[i].teamId)?.text || '';
  const selectedChannelText = channels.find(channel => channel.value === childern[i].channelId)?.text || '';
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
    props: { value: `Space: ${selectedSpaceText}<br>Teams: ${selectedTeamText}<br>Channel: ${selectedChannelText}`, format: 'markdown' },
    
  },
  {
    id: 'edit-button'+i,
    name: 'Button',
    props: {  variant: 'outline', callbackId: 'e' },
    childern: ['buttonEdit'+i]
  },
  {
    id: 'buttonEdit'+i,
    name: 'Text',
    props: { value: 'edit' },
  },
  {
    id: 'delete-button'+i,
    name: 'Button',
    props: {  variant: 'outline', callbackId: 'd'},
    childern: ['buttonDelete'+i]
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
      name: 'Button',
      props: { variant: actionVariant, callbackId: actionCallbackId, text: action },
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
