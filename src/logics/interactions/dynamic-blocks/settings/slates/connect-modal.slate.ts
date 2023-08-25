import { InputIds, Space } from '@tribeplatform/gql-client/types'
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos'
import { SettingsBlockCallback } from '../constants'
import { ChannelRepository } from '@/repositories/channel.repository'

export const getConnectModalSlate = async (options?: {
  objectId?: string
  upgradeMode?: boolean
  showEnvPicker?: true
  spaces?: object
  teams?: InputIds[]
  channels?: object // Add channels option
  showTeams?: boolean
  editMode?: boolean
  team?: InputIds
  space?: InputIds
  channel?: InputIds
}): Promise<RawSlateDto> => {
  const {
    spaces,
    teams,
    channels,
    showTeams,
    editMode,
    team,
    channel,
    space,
    objectId,
    upgradeMode,
  } = options || {}
  let channelRep: any
  const eventsList = [
    'post.published',
    'member.verified',
    'member_invitation.created',
    'space_join_request.accepted',
    'space_join_request.created',
    'moderation.created',
    'moderation.rejected',
    'moderation.accepted',
    'space_membership.deleted',
    'space_membership.created',
  ]
  const eventBlocks = eventsList.map(event => {
    return {
      id: event,
      name: 'Toggle',
      props: { name: event, label: event, checked: false },
    }
  })
  let mappedEvents
  if (objectId) {
    channelRep = await ChannelRepository.findUnique(objectId)
    mappedEvents = channelRep.events.reduce(
      (accumulator, event) => ({
        ...accumulator,
        [event]: true,
      }),
      { teamId: team.value, spaceId: space.value, channelId: channel.value },
    )
  }

  console.log('channelRep in edit', channelRep)
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
            : {
                teamId: showTeams ? teams[0].value : [],
                spaceId: spaces[0].value,
              },

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
        children: [...eventsList],
      },
      ...eventBlocks,
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
