import axios from "axios";

export const getSpace = async ( tribeClient ,spaceId: string) => {
    const space = await tribeClient.spaces.get({ id: spaceId }, 'all');
    return space;
}
export const getMember = async ( tribeClient ,memberId: string) => {
    const member = await tribeClient.members.get({ id: memberId }, 'all');
    return member;
}
export const getPost = async ( tribeClient ,postId: string) => {
    const post = await tribeClient.posts.get({ id: postId }, 'all');
    return post;
}

export const sendProactiveMessage = async (message: string, channels: string[], url?, title?, mode?: string) => {
  const options = {
    mode: mode ? mode : 'default',
    message: message,
    channelIds: channels,
    url: url ? url : null,
    title: title ? title : null,
  }
  const endpoint = 'http://localhost:3978/api/notification'
  
    const response = await axios.post(endpoint, options)
    console.log('message status', response.status)

}