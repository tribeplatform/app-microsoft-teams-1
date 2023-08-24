import { sendProactiveMessage } from '@/logics/oauth.logic'
import { EventVerb } from '@tribeplatform/gql-client/global-types'

export const memberShipSpace = async (
  member,

  self,
  mode: EventVerb,
  space,
  channels,
  actor?,
): Promise<void> => {
  let message
  switch (mode) {
    case EventVerb.CREATED:
      if (self == true) {
        message = `${member} joined ${space.name}`
      } else {
        message = `${actor} added ${member} to ${space.name} `
      }
      await sendProactiveMessage(message, channels)
      break
    case EventVerb.DELETED:
      if (self == true) {
        message = `${member} left ${space.name}`
      } else {
        message = `${actor} removed ${member} from ${space.name}`
      }
      await sendProactiveMessage(message, channels, space.url)
      break
  }
}
