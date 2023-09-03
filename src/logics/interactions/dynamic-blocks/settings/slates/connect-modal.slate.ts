import { InputIds, Space } from '@tribeplatform/gql-client/types'
import {events} from './constants/events.constant'
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos'
import { SettingsBlockCallback } from '../constants'
import { ChannelRepository } from '@/repositories/channel.repository'

export const getConnectModalSlate = async (options?: {
  objectId?: string
  upgradeMode?: boolean
  spaces?: object
  teams?: InputIds[]
  channels?: object // Add channels option
  editMode?: boolean
  team?: InputIds
  space?: InputIds
  channel?: InputIds
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
    editMode,
    team,
    channel,
    space,
    objectId,
    upgradeMode,
    defaultValues
  } = options || {}
  let channelRep: any

  //TODO:
  let mappedEvents
  if (objectId) {
    channelRep = await ChannelRepository.findUnique(objectId)
    console.log('channelRep in edit', channelRep)
    
    mappedEvents = channelRep.events.reduce(
      (accumulator, event) => ({
        ...accumulator,
        [event]: true,
      }),
      { teamId: teams[0].value? teams[0].value:null, spaceId: spaces[0].value?spaces[0].value:null, channelId: channels[0].value?channels[0].value:null },
    )
  }

  // console.log('channelRep in edit', channelRep)
  const id = Math.floor(Math.random() * Date.now()).toString(36)
  return {
    rootBlock: id,
    blocks: [
      {
        id: id,
        name: 'Form',
        props: {
          callbackId:
            editMode || upgradeMode
              ? SettingsBlockCallback.Update + '-' + objectId
              : SettingsBlockCallback.SaveModal,
          defaultValues: editMode
            ? mappedEvents
            : defaultValues,

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
        children: [...(events.map(event => (event.id)))],
      },
      ...(events.map(event => {
        return {
          id: event.id,
          name: 'Toggle',
          props: { name: event.id, label: event.id, checked: false },
        }
      })),
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
          callbackId: editMode
            ? 'upgrade-' + objectId
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
          callbackId:
            editMode || upgradeMode
              ? SettingsBlockCallback.Update + '-' + objectId
              : SettingsBlockCallback.SaveModal, // Callback ID for the "Save" button
          type: 'submit', // You can use 'submit' if it's a form submit button
          variant: editMode || upgradeMode ? 'basic' : 'primary',
          text: editMode || upgradeMode ? 'Update' : 'Save',
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
