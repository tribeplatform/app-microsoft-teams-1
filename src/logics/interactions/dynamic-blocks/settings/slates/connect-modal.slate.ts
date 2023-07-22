import { Space } from '@tribeplatform/gql-client/types';
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos';
import { SettingsBlockCallback } from '../constants';

export const getConnectModalSlate = (options?: {
  showEnvPicker?: true;
  spaces?: Array<Space>;
  teams?: object;
  channels?: object; // Add channels option
}): RawSlateDto => {
  const { spaces, teams, channels } = options || {};
  const id = Math.floor(Math.random() * Date.now()).toString(36)
  return {
    rootBlock: id,
    blocks: [
      {
        id: id,
        name: 'Form',
        props: {
          callbackId: SettingsBlockCallback.SaveModal,
          spacing: 'md',
        },
        children: ['auth'],
      },
      
      {
        id: 'auth',
        name: 'Container',
        props: { spacing: 'md' },
        children: ['auth.spacePicker', 'auth.teamPicker', 'auth.channelPicker', 'auth.fetchChannelsButton', 'auth.save', 'auth.footer'], // Add 'auth.channelPicker'
      },
      {
        id: 'auth.spacePicker',
        name: 'Select',
        props: {
          name: 'spaceId',
          label: 'Space',
          items: spaces.map(space => ({value: space.id, text: space.name})),
          required: true,
        },
      },
      {
        id: 'auth.teamPicker',
        name: 'Select',
        props: {
          callbackId: SettingsBlockCallback.FetchChannels,

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
          callbackId: SettingsBlockCallback.SaveModal, // Callback ID for the "Save" button
          type: 'submit', // You can use 'submit' if it's a form submit button
          variant: 'primary',
          text: 'Save',
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
