/**
 * Helper function to call MS Graph API endpoint
 * using the authorization bearer token scheme
 */
import axios, * as others from 'axios'
export async function callMSGraph(endpoint, token) {
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  console.log('request made to Graph API at: ' + new Date().toString())

  try {
    console.log(endpoint + 'endpoint')
    const response = await axios.get(endpoint, options)
    return await response.data
  } catch (error) {
    throw new Error(error)
  }
}

export async function createChat(endpoint, token, userId0, userId1) {
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: {
      chatType: 'oneOnOne',
      members: [
        {
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          roles: ['owner'],
          'user@odata.bind':
            `https://graph.microsoft.com/v1.0/users('hr.kh1380@gmail.com')`,
        },
        {
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          roles: ['owner'],
          'user@odata.bind':
            `https://graph.microsoft.com/v1.0/users('hamidreza@bettermode.com')`,
        },
      ],
    },
  }

  console.log('request made to Graph API at: ' + new Date().toString())

  try {
    console.log(endpoint + 'endpoint')
    const response = await axios.post(endpoint, options)
    return await response
  } catch (error) {
    throw new Error(error)
  }
}
