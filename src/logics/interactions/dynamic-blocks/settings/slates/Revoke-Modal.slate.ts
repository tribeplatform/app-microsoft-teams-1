import { RawSlateDto } from '@tribeplatform/slate-kit/dtos'

export const RevokeModal = async (): Promise<RawSlateDto> => {
  return {
    rootBlock: 'root',
    blocks: [
      {
        id: 'root',
        name: 'Container',
        props: { spacing: 'md' },
        children: [ 'alert','button'],
      },
      {
        id: 'alert',
        name: 'Alert',
        props: {
            "status":"warning",
            "title": "Are you sure you want revoke. If you revoke everything will delete.",
      }},
      {
        id: 'button',
        name: 'Button',
        props: {
        size: 'md',
        fullWidth: false,
          text: 'Delete',

          callbackId: 'auth-voke',
        },
      },
    ],
  }
}