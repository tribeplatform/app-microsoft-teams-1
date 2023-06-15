/**
 * Helper function to call MS Graph API endpoint
 * using the authorization bearer token scheme
 */
var axios = require('axios').default
async function callMSGraph(endpoint, token, callback) {
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  console.log('request made to Graph API at: ' + new Date().toString())

  try {
    console.log(endpoint + 'endpoint' + options.headers.Authorization)
    const response = await axios.get(endpoint, options)
    return await response.data
  } catch (error) {
    throw new Error(error)
  }
}
