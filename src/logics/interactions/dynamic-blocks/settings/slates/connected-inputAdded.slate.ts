import { Network } from '@prisma/client';
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos';
import moment from 'moment';

import { SettingsBlockCallback } from '../constants';

import { getAuthSettingsBlocks } from './auth.slate';

export const connectedAddedDetails = (options: {
  user: Network;
  selectedSpace: string;
  selectedTeam: string;
  selectedChannel: string;
}): RawSlateDto => {
  const { user, selectedSpace, selectedTeam, selectedChannel } = options;

  return {
    rootBlock: 'root',
    blocks: [
      {
        id: 'root',
        name: 'Container',
        props: { spacing: 'md' },
        children: ['chanels-integration', 'adding-teams', 'auth', ],
      },
    ...getAuthSettingsBlocks({
        id: 'adding-teams',
        action: 'Add Teams',
        title: 'Teams channels',
        actionCallbackId: SettingsBlockCallback.OpenModal,
        actionVariant: 'primary',
        // secondaryActionCallbackId: SettingsBlockCallback.OpenConnectModal,
        description:'hello world'
      }),
      ...getAuthSettingsBlocks({
        id: 'auth',
        action: 'Revoke',
        actionCallbackId: SettingsBlockCallback.AuthVoke,
        actionVariant: 'danger',
        // secondaryActionCallbackId: SettingsBlockCallback.OpenConnectModal,
        description: `Connected by [${user.name}] on ${moment(user.createdAt).format(
          'MMMM Do YYYY, h:mm a',
        )}<br>By revoking access, you will lose your sedefcbwhebcjwcbejwsdcwdjcbsdwjv  able to use Microsoft Teams features on Bettermode.`,
      }),
    ],
  }
}