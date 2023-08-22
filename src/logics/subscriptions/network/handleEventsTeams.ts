import { sendProactiveMessage } from '@/logics/oauth.logic'

export const handlePostCreated = async (name, url, title, channels): Promise<void> => {
  const message = `${name} added a post with the title ${title}!`
  await sendProactiveMessage(message, channels, url)
}

export const memberShipSpace = async (
  messag: any,
  self,
  mode,
  channels,
): Promise<void> => {
  let message
  if (mode == 'created') {
    if (self == true) {
      message = `${messag.member} joined ${messag.space}`
    } else {
      message = `${messag.actor} added ${messag.member} to ${messag.space} `
    }
    await sendProactiveMessage(message, channels)
  } else if (mode == 'deleted') {
    if (self == true) {
      message = `${messag.member} left ${messag.space}`
    } else {
      message = `${messag.actor} removed ${messag.member} from ${messag.space}`
    }
    await sendProactiveMessage(message, channels)
  }
}

export const modration = async (messag: any, mode, url, channels): Promise<void> => {
  if (mode == 'created') {
    const message = `${messag.member} was flagged for moderation`
    await sendProactiveMessage(message, channels, url)
  } else if (mode == 'rejected') {
    const message = `${messag.actor} approved this post`
    await sendProactiveMessage(message, channels, url)
  } else if (mode == 'accepted') {
    const message = `${messag.actor} rejected this post`
    await sendProactiveMessage(message, channels, url)
  }
}

export const spaceJoinRequest = async (messag: any, mode, channels): Promise<void> => {
  if (mode == 'created') {
    const message = `${messag.member} requested to join ${messag.space}`
    await sendProactiveMessage(message, channels)
  } else if (mode == 'accepted') {
    const message = `${messag.actor} accepted ${messag.member}'s request to join ${messag.space}`
    await sendProactiveMessage(message, channels)
  }
}

export const memberInvitation = async (messag: any, channels): Promise<void> => {
  const message = `${messag.actor} invited ${messag.member} to the community.`
  await sendProactiveMessage(message, channels)
}

export const memberVerified = async (messag: any, channels): Promise<void> => {
  const message = `${messag.member} joined the community.`
  await sendProactiveMessage(message, channels)
}
