
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

