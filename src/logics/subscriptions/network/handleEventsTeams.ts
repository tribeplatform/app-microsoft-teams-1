import { sendProactiveMessage } from '@/logics/oauth.logic'

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
