
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos'

export const revokeModal = async (): Promise<RawSlateDto> => {
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
            "title": "Are you sure you want to Revoke? Please keep in mind that by revoking, all connections will be deleted",
      }},
      {
        id: 'button',
        name: 'Button',
        props: {
        size: 'md',
        fullWidth: false,
          text: 'Revoke',

          callbackId: 'auth-voke'
        },
      },
    ],
  }
}
