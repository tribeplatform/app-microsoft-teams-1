import { sendProactiveMessage } from "@/logics/oauth.logic"

export const handlePostCreated = async (actor, post, space, channels): Promise<void> => {
    const message = `${actor.name} added a post with the title ${post.title}!`
    await sendProactiveMessage(message, channels, post.url)
  }