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

export const sendProactiveMessage = async (options:{message: string, channels: string[], postUrl?,userUrl?,actorUrl?, title?, mode?: string, spaceUrl?, self?}) => {
  const {message, channels, postUrl, title, mode, userUrl, actorUrl, spaceUrl, self} = options
  const option = {
    mode: mode ? mode : 'default',
    message: message,
    channelIds: channels,
    postUrl: postUrl ?postUrl : null,
    title: title ? title : null,
    userUrl: userUrl ? userUrl : null,
    actorUrl: actorUrl ? actorUrl : null,
    spaceUrl: spaceUrl ? spaceUrl : null,
    self: self ? self : null
  }
  const endpoint = 'http://localhost:3978/api/notification'
  
    const response = await axios.post(endpoint, option)
    console.log('message status', response.status)

}