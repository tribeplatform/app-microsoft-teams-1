import { sendProactiveMessage } from "@/logics/oauth.logic";
import { SubscriptionWebhook } from "@interfaces";
import { Network } from "@prisma/client";


export const handlePostCreated = async ( name, url, title, chanels): Promise<void> => {
    const message = `${name} added a post with the title ${title}!`
    await sendProactiveMessage(message, chanels, url)
    
}