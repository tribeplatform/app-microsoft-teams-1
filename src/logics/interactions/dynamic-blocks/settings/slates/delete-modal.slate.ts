
import { RawSlateDto } from '@tribeplatform/slate-kit/dtos'

export const deleteModal = async (options: { id: string }): Promise<RawSlateDto> => {
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
            "title": "Are you sure you want to delete this integration?",
      }},
      {
        id: 'button',
        name: 'Button',
        props: {
        size: 'md',
        fullWidth: false,
          text: 'Delete',

          callbackId: 'removeBlock-' + options.id,
        },
      },
    ],
  }
}
