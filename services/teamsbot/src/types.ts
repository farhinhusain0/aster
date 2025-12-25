export interface TextContent {
  type: "text";
  text: string;
}

export interface ImageContent {
  type: "image_url";
  image_url: {
    url: string;
  };
}
export interface ChatMessage {
  role: string;
  content: string | (TextContent | ImageContent)[];
}

export interface TeamsAdaptiveCardBodyItem {
  type: 'TextBlock' | 'ColumnSet' | 'Container';
  text?: string;
  columns?: Object[];
  items?: Object[];
}

export interface ITeamsCreationParams {
  tenantId: string;
  channelId: string;
  aadGroupId: string;
  teamId: string;
}

export interface ITeamsMessageResourceData {
  id: string;
  '@odata.type': string;
  '@odata.id': string;
}

export interface IExtractedIds {
  messageId: string;
  teamId: string;
  channelId: string;
}