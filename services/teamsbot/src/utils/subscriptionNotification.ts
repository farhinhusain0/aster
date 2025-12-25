import {
    IExtractedIds,
    ITeamsMessageResourceData,
  } from "../types";
  
  // Function to extract IDs from Teams message resource data
  export function extractIdsFromResourceData(
    resourceData: ITeamsMessageResourceData,
  ): IExtractedIds {
    const messageId = resourceData.id;
  
    // Extract team ID and channel ID from the @odata.id
    // Format: "teams('{teamId}')/channels('{channelId}')/messages('{messageId}')"
    const odataId = resourceData["@odata.id"];
  
    // Extract team ID - between "teams('" and "')"
    const teamIdMatch = odataId.match(/teams\('([^']+)'\)/);
    const teamId = teamIdMatch ? teamIdMatch[1] : "";
  
    // Extract channel ID - between "channels('" and "')"
    const channelIdMatch = odataId.match(/channels\('([^']+)'\)/);
    const channelId = channelIdMatch ? channelIdMatch[1] : "";
  
    return {
      messageId,
      teamId,
      channelId,
    };
  }
  