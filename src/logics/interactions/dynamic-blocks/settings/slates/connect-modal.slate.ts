import { Space } from '@tribeplatform/gql-client/types'
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos'
import { SettingsBlockCallback } from '../constants'
import { ChannelRepository } from '@/repositories/channel.repository'

export const getConnectModalSlate = async (options?: {
  objectId?: string
  upgradeMode?: boolean
  showEnvPicker?: true
  spaces?: object
  teams?: object
  channels?: object // Add channels option
  showTeams?: boolean
  editMode?: boolean
  team?: object
  space?: object
  channel?: object
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
  let post: boolean = false
  if(objectId){ 
   channelRep = await ChannelRepository.findUnique(objectId)

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
            ? {
                teamId: team.value,
                spaceId: space.value,
                channelId: channel.value,
                post: channelRep.post,
                modarationCreated: channelRep.modarationCreated,
                modarationRejected: channelRep.modarationRejected,
                modarationAccepted: channelRep.modarationAccepted,
                memberVerified: channelRep.memberVerified,
                memberInvitionAccepted: channelRep.memberInvitionAccepted,
                spaceMemberDeleted: channelRep.spaceMemberDeleted,
                spaceJoinRequestCreated: channelRep.spaceJoinRequestCreated,
                spaceJoinRequestAccepted: channelRep.spaceJoinRequestAccepted,
                spaceMemberCreated: channelRep.spaceMemberCreated,
                

              }
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
        ], // Add 'auth.channelPicker'
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
        children: ['auth.toggle.postCreated', 'auth.toggle.modarationCreated', 'auth.toggle.modarationRejected', 'auth.toggle.modarationAccepted', 'auth.toggle.memberVerified', 'auth.toggle.memberInvitionAccepted', 'auth.toggle.spaceMemberDeleted', 'auth.toggle.spaceMemberCreated', 'auth.toggle.spaceJoinRequestCreated', 'auth.toggle.spaceJoinRequestAccepted'],
      },
      {
        id: 'auth.toggle.postCreated',
        name: 'Toggle',
        props: { name: 'post', label: 'Post created' },
      },
      {
        id: 'auth.toggle.modarationCreated',
        name: 'Toggle',
        props: { name: 'modarationCreated', label: 'Modaration created', checked: channelRep ? channelRep.modarationCreated : false },
      },
      {
        id: 'auth.toggle.modarationRejected',
        name: 'Toggle',
        props: { name: 'modarationRejected', label: 'Modaration rejected', checked: channelRep ? channelRep.modarationRejected : false },
      },
      {
        id: 'auth.toggle.modarationAccepted',
        name: 'Toggle',
        props: { name: 'modarationAccepted', label: 'Modaration accepted', checked: channelRep ? channelRep.modarationAccepted : false },
      },
      {
        id: 'auth.toggle.memberVerified',
        name: 'Toggle',
        props: { name: 'memberVerified', label: 'Member verification', checked: channelRep ? channelRep.memberVerified : false },
      },
      {
        id: 'auth.toggle.spaceMemberCreated',
        name: 'Toggle',
        props: { name: 'spaceMemberCreated', label: 'Space member created', checked: channelRep ? channelRep.spaceMemberCreated : false },
      },
      {
        id: 'auth.toggle.memberInvitionAccepted',
        name: 'Toggle',
        props: { name: 'memberInvitionAccepted', label: 'Member invitation acceptance', checked: channelRep ? channelRep.memberInvitionAccepted : false },
      },
      {
        id: 'auth.toggle.spaceMemberDeleted',
        name: 'Toggle',
        props: { name: 'spaceMemberDeleted', label: 'Space member deleted', checked: channelRep ? channelRep.spaceMemberDeleted : false },
      },
      {
        id: 'auth.toggle.spaceJoinRequestCreated',
        name: 'Toggle',
        props: { name: 'spaceJoinRequestCreated', label: 'Space join request created', checked: channelRep ? channelRep.spaceJoinRequestCreated : false },
      },
      {
        id: 'auth.toggle.spaceJoinRequestAccepted',
        name: 'Toggle',
        props: { name: 'spaceJoinRequestAccepted', label: 'Space join request accepted', checked: channelRep ? channelRep.spaceJoinRequestAccepted : false },
      },
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

      // {
      //   id: 'auth.action',
      //   name: 'Button',
      //   props: {
      //     type: 'submit',
      //     variant: 'primary',
      //     text: 'Connect',
      //   },
      // },
    ],
  }
}
