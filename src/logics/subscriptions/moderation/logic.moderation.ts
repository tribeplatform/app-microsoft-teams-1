import { sendProactiveMessage } from '@/logics/oauth.logic'
import { EventVerb } from '@tribeplatform/gql-client/global-types'

export const modration = async (
  object,
  mode: EventVerb,
  space,
  channels,
): Promise<void> => {
  let message: string = ''
  switch (mode) {
    case EventVerb.CREATED:
      message = `${object.object.name} was flagged for moderation`
      await sendProactiveMessage(message, channels, space.url)
      break
    case EventVerb.REJECTED:
      message = `${object.name} approved this post`
      await sendProactiveMessage(message, channels, space.url)
    case EventVerb.ACCEPTED:
      message = `${object.name} rejected this post`
      await sendProactiveMessage(message, channels, space.url)
  }
}
