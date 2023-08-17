import { Space } from '@tribeplatform/gql-client/types';
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos';
import { SettingsBlockCallback } from '../constants';

export const getConnectModalSlate = (options?: {
  objectId?: string;
  upgradeMode?: boolean;
  showEnvPicker?: true;
  spaces?: object;
  teams?: object;
  channels?: object; // Add channels option
  showTeams?: boolean;
  editMode?: boolean;
  team?: object;
  space?: object;
  channel?: object;


}): RawSlateDto => {
  const { spaces, teams, channels, showTeams, editMode, team, channel, space, objectId, upgradeMode } = options || {};

  const id = Math.floor(Math.random() * Date.now()).toString(36)
  return {
    rootBlock: id,
    blocks: [
      {
        id: id,
        name: 'Form',
        props: {
          callbackId: (editMode || upgradeMode)? SettingsBlockCallback.Update +"-"+objectId :SettingsBlockCallback.SaveModal,

         
          defaultValues: editMode ? {
            teamId: team.value,
            spaceId: space.value,
            channelId: channel.value,
          } : {

            
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
        children: ['auth.spacePicker', 'auth.teamId', 'auth.channelPicker', 'auth.fetchChannelsButton', 'auth.save', 'auth.footer'], // Add 'auth.channelPicker'
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
          callbackId:editMode ? "upgrade-"+objectId : SettingsBlockCallback.FetchChannels,

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
          callbackId: (editMode || upgradeMode) ? SettingsBlockCallback.Update +"-"+objectId : SettingsBlockCallback.SaveModal, // Callback ID for the "Save" button
          type: 'submit', // You can use 'submit' if it's a form submit button
          variant: (editMode || upgradeMode) ? 'basic' : 'primary',
          text: (editMode || upgradeMode) ? 'Update' : 'Save',
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
  };
};
