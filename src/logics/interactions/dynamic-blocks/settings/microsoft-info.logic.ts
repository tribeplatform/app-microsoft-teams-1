import { getNetworkClient } from '@clients';
import { RefreshTokenClient } from '@middlewares';
import axios from 'axios';

// Function to get the list of teams using the access token
export const getListOfTeams = async (accessToken: string, refreshToken, networkId) => {
  try {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me/joinedTeams', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const Teamdictionary: { value: string; text: string }[] = []
    const teams = response.data.value; 
    teams.forEach((team: any) => {
      Teamdictionary.push({
        value: team.id,
        text: team.displayName,
      });
    });
    return Teamdictionary;
  } catch (error) {
    console.error('Error fetching teams:', error);
    RefreshTokenClient(refreshToken, networkId)
    // You can handle the error in the calling function
  }
};

export const getSpaces = async (networkId: string) => {
  try{
    const gqlClient = await getNetworkClient(networkId)

    const spaces = await gqlClient.query({
      name: 'spaces',
      args: {
        fields: { nodes: 'basic' },
        variables: {
          limit: 100,
        },
      },
    })
    return spaces.nodes
    
  } catch (error) {
    console.error('Error fetching Spaces:', error);
    throw error; // You can handle the error in the calling function
  }
}


export const getListOfChannels = async (accessToken: string, teamId: string) => {
  try {
    const response = await axios.get(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    const channels = response.data.value;
    const channelsdictionary: { value: string; text: string }[] = []
    channels.forEach((team: any) => {
      channelsdictionary.push({
        value: team.id,
        text: team.displayName,
      });
    });

    return channelsdictionary;
  } catch (error) {
    console.error('Error fetching channels:');
  }
};

