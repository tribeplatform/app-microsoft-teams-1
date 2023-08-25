import { RawBlockDto } from '@tribeplatform/slate-kit/dtos'

import { SettingsBlockCallback } from '../constants'
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
    name: 'Container',
    props: {direction: "vertical-reverse", padding: 'lg'},
    children: [`${id}.container`,`${id}.rightContainer`],

  }

const details = []
if(childern){
for (let i = 0; i< childern.length; i++){
  const selectedSpaceText = spaces.find(space => space.value === childern[i].spaceIds)?.text || '';
  const selectedTeamText = teams.find(team => team.value === childern[i].teamId)?.text || '';
  // const selectedChannelText = channels.find(channel => channel.value === childern[i].channelId)?.text || '';
  const selectedChannelText = 'masih'
  details.push(
    {
      id: id+'.'+i+'container',
      name: 'Container',
      props: { padding:"lg", direction: 'horizontal', alignment: {vertical: 'center'}, className: 'justify-between' },
      // children: [id+'.'+i+'description', 'Buttons-container'+i],
      children: [ 'description'+i, 'Buttons-container'+i],

    },
    {
    id: 'description'+i,
    name: 'Container',
    props: {  alignment: { horizontal: 'left'}  },
    children: ['description-text'+i]
    
  },
  {
    id: 'description-text'+i,
    name: 'Text',
    props: { value: `Space: ${selectedSpaceText}<br>Teams: ${selectedTeamText}<br>Channel: ${selectedChannelText}`, format: 'markdown' },

  },
  {
    id: 'Buttons-container'+i,
    name: 'Container',
    props: {  direction: 'horizontal-reverse', alignment: { horizontal: 'right'}  },
    children: ['edit-button'+i, 'delete-button'+i]
  },
  {
    id: 'edit-button'+i,
    name: 'Button',
    props: {  variant: 'danger', size: 'xs', callbackId: 'e', },
    children: ['buttonEdit'+i]
  },
  {
    id: 'buttonEdit'+i,
    name: 'Icon',
    props: { name: 'alert-triangle', size: 'xs', iconType: 'outline', color: 'primary'  },
  
  },
  {
    id: 'delete-button'+i,
    name: 'Button',
    props: {  variant: 'danger',text: 'Delete', size: 'xs', callbackId: 'd'},
    children: ['buttonDelete'+i]
  },
  {
    id: 'buttonDelete'+i,
    name: 'Icon',
    props: { name: 'refresh-cw-hr', size: 'xs', iconType: 'solid', color: 'primary'  },
  },

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
        // alignment: { vertical: 'end', horizontal: 'left' },
        shrink: true,
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
