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
  spaces?
  teams?
  channels?
  token?
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

  const card_content = {
    id: `${id}.content`,
    name: 'Container',
    props: { direction: 'vertical-reverse', padding: 'md' },
    children: [`${id}.container`, `${id}.rightContainer`],
  }
  const details = []
  const length = childern?.length || 0
  if (childern) {
    for (let i = 0; i < childern.length; i++) {
      const selectedSpaceText =
        spaces.find(space => space.value === childern[i].spaceIds)?.text || ''
      const selectedTeamText = teams.find(team => team.value === childern[i].teamId)
      const channel = await getListOfChannels(token, selectedTeamText.value)
      const selectedChannelText =
        channel.find(channel => channel.value === childern[i].channelId)?.text || ''
      const selectedObjectId = childern[i].id
      details.push(
        {
          id: `${id}.${i}.container`,
          name: 'Card',
          props: {  direction: 'horizontal', className: 'flex justify-around' },
          children: [ `${id}.${i}.cardContent`],
        },
        {
          id: `${id}.${i}.cardContent`,
          name: 'Card.Content',
          children :[`${id}.${i}.description-container`,`${id}.${i}.button-container`],
          props: {  direction: 'horizontal', className: 'flex justify-between' },
        },
        {
          id: `${id}.${i}.description-container`,
          name: 'Container',
          props: { padding: 'md', direction: 'horizontal', className: 'justify-around' },
          children: [`${id}.${i}.description`, ],
        },
        {
          id: `${id}.${i}.button-container`,
          name: 'Card.Content',
          props: { padding: 'md', direction: ' horizontal ', className: 'flex right-0 gap-x-2 lg:p-6' ,  alignment: { horizontal: 'right' },},
          children: [ `edit-button.${i}`,`delete-button.${i}` ],
        },

        {
          id: `${id}.${i}.description`,
          name: 'Text',
          props: {
            className: '',
            value: `Space: ${selectedSpaceText}<br>Teams: ${selectedTeamText.text}<br>Channel: ${selectedChannelText}`,
            format: 'markdown',
          },
        },
        {
          id: `edit-button.${i}`,
          name: 'Button',
          props: {
            calssName: 'self-center',
            variant: 'basic',
            callbackId: `edit-${selectedObjectId}`,
            text: 'Edit',
            className: 'mx-2',
          },
          children: [`${i}.iconEdit`],
        },
        {
          id: `${i}.iconEdit`,
          name: 'Image',
          props: {
            shape: 'rounded',
            className:'object-none rounded-none',
            size: 'xs',
            url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 512 512'%3E%3C!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --%3E%3Cpath d='M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z'/%3E%3C/svg%3E"
          },
        },
        {
          id: `${i}.iconDelete`,
          name: 'Image',
          props: {
            shape: 'rounded',
            className:'object-none',
            size: 'xs',
            url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 448 512'%3E%3C!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --%3E%3Cpath d='M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z'/%3E%3C/svg%3E",
          },
        },
        {
          id: `delete-button.${i}`,
          name: 'Button',
          props: {
            variant: 'danger',
            callbackId: `delete-${selectedObjectId}`,
            text: 'Delete',
          },
          children: [`${i}.iconDelete`],
        },
      )
      card_content.children.push(`${id}.${i}.container`)
    }
  } else {
    const blocks = {
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
    {
      id: `${id}.content`,
      name: 'Card.Content',
      props: { direction: 'vertical-reverse', padding: 'md' },
      children: [`${id}.container`],
    },
    card_content,
    ...details,

    {
      id: `${id}.rightContainer`,
      name: 'Container',
      props: {
        direction: 'horizontal-reverse',
        spacing: 'xs',
        alignment: { horizontal: 'left' },
        shrink: false,
      },
      children: [`${id}.action`],
    },
    {
      id: `${id}.action`,
      name: length >= 3 ? 'Alert' : 'Button',
      props:
        length >= 3
          ? {
              status: 'warning',
              title: 'you have reached the max!',
            }
          : { variant: actionVariant, callbackId: actionCallbackId, text: action },
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
