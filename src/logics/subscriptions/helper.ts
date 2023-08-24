import { TribeClient } from "@tribeplatform/gql-client"
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
const getAllMemberSpaces = async (gqlClient: TribeClient, id: string) => {
  const spaces = []
  let hasNextPage = true
  let after = null
  while (hasNextPage) {
    const currentBatch = await gqlClient.query({
      name: 'memberSpaces',
      args: {
        variables: { memberId: id, limit: 100, after },
        fields: {
          nodes: {
            space: 'basic',
          },
          pageInfo: 'all',
        },
      },
    })
    after = currentBatch.pageInfo.endCursor
    currentBatch?.nodes?.forEach(spaceMember => spaces.push(spaceMember?.space))
    hasNextPage = currentBatch.pageInfo.hasNextPage
  }
  return spaces
}
