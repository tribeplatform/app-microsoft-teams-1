import { InputIds, Space } from '@tribeplatform/gql-client/types'
import { events } from './constants/events.constant'
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos'
import { SettingsBlockCallback } from '../constants'

export const getConnectModalSlate = async (options?: {
  objectId?: string
  spaces?: object
  teams?: InputIds[]
  channels?: object // Add channels option
  /////////////////////////////
  formCallbackId?: string
  channelCallbackId?: string
  defaultValues?: any
  buttonVariant?: string
  buttonText?: string
}): Promise<RawSlateDto> => {
  const {
    spaces,
    teams,
    channels,
    formCallbackId,
    channelCallbackId,
    defaultValues,
    buttonText,
    buttonVariant,
  } = options || {}
  const id = Math.floor(Math.random() * Date.now()).toString(36)
  return {
    rootBlock: id,
    blocks: [
      {
        id: id,
        name: 'Form',
        props: {
          callbackId: formCallbackId ? formCallbackId : SettingsBlockCallback.SaveModal,
          defaultValues: defaultValues,

          spacing: 'md',
        },
        children: ['auth'],
      },

      {
        id: 'auth',
        name: 'Container',
        props: { spacing: 'md' },
        children: [
          'auth.spacePicker',
          'auth.teamId',
          'auth.channelPicker',
          'auth.fetchChannelsButton',
          'auth.toggles',
          'auth.save',
          'auth.footer',
        ],
      },

      {
        id: 'auth.toggles',
        name: 'Card',
        props: { spacing: 'md' },
        children: [, 'auth.toggle.title', 'auth.toggle.body'],
      },
      {
        id: 'auth.toggle.title',
        name: 'Card.Header',
        props: { title: 'Subscribtion toggles' },
      },
      {
        id: 'auth.toggle.body',
        name: 'Card.Content',
        props: { spacing: 'md' },
        children: [...events.map(event => event.id)],
      },
      ...events.map(event => {
        return {
          id: event.id,
          name: 'Toggle',
          props: { name: event.id, label: event.id, checked: false },
        }
      }),
      {
        id: 'auth.spacePicker',
        name: 'Select',
        props: {
          name: 'spaceId',
          label: 'Space',
          items: spaces,
          required: true,
        },
      },
      {
        id: 'auth.teamId',
        name: 'Select',
        props: {
          callbackId: channelCallbackId
            ? channelCallbackId
            : SettingsBlockCallback.FetchChannels,

          name: 'teamId',
          label: 'Team',
          items: teams,
          required: true,
        },
      },
      {
        id: 'auth.channelPicker', // The new channel picker
        name: 'Select',
        props: {
          name: 'channelId',
          label: 'Channel',
          items: channels, // Use the 'channels' object to populate the channel options
          required: true,
        },
      },

      {
        id: 'auth.save',
        name: 'Button',
        props: {
          callbackId: formCallbackId ? formCallbackId : SettingsBlockCallback.SaveModal, // Callback ID for the "Save" button
          type: 'submit', // You can use 'submit' if it's a form submit button
          variant: buttonVariant ? 'basic' : 'primary',
          text: buttonText ? 'Update' : 'Save',
        },
      },
      {
        id: 'auth.footer',
        name: 'Container',
        props: { direction: 'horizontal-reverse' },
        children: ['auth.action'],
      },
    ],
  }
}
