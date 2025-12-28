  // Declare global window.ENV for runtime environment variables
declare global {
  interface Window {
    ENV?: {
      VITE_API_SERVER_URL?: string;
      VITE_API_TUNNEL_URL?: string;
      VITE_GITHUB_CLIENT_ID?: string;
      VITE_SLACK_CLIENT_ID?: string;
      VITE_NOTION_CLIENT_ID?: string;
      VITE_ATLASSIAN_CLIENT_ID?: string;
      VITE_PAGER_DUTY_CLIENT_ID?: string;
      VITE_CHATWOOT_EMAIL_PREFIX?: string;
      VITE_CHATWOOT_WEBTOKEN?: string;
      VITE_CHATWOOT_KEY?: string;
      VITE_MOCK_API_CALLS?: string;
      VITE_MICROSOFT_TEAMS_APP_ID?: string;
    };
  }
}

// Helper function to get environment variable from runtime (window.ENV) or build-time (import.meta.env)
const getEnvVar = (key: string, fallback?: string): string => {
  // First try runtime environment variables (injected via env.js)
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key as keyof typeof window.ENV]) {
    return window.ENV[key as keyof typeof window.ENV] as string;
  }
  
  // Fallback to build-time environment variables
  if (import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  
  // Return fallback if provided
  return fallback || '';
};

// When we package the dashboard image, we can't define the API_SERVER_URL in the .env file,
// In the build version the API_SERVER_URL is always window.location.origin+'/api'
export const API_SERVER_URL = getEnvVar('VITE_API_SERVER_URL')
export const API_TUNNEL_URL = getEnvVar('VITE_API_TUNNEL_URL');
export const GITHUB_CLIENT_ID = getEnvVar('VITE_GITHUB_CLIENT_ID');
export const SLACK_CLIENT_ID = getEnvVar('VITE_SLACK_CLIENT_ID');
export const NOTION_CLIENT_ID = getEnvVar('VITE_NOTION_CLIENT_ID');
export const ATLASSIAN_CLIENT_ID = getEnvVar('VITE_ATLASSIAN_CLIENT_ID');
export const PAGER_DUTY_CLIENT_ID = getEnvVar('VITE_PAGER_DUTY_CLIENT_ID');

// JSON.parse transforms "true"/"false" to native types true/false.
const mockApiCallsValue = getEnvVar('VITE_MOCK_API_CALLS');
export const SHOULD_MOCK_API = mockApiCallsValue
  ? JSON.parse(mockApiCallsValue)
  : false;

// Turn this on in order to show the chat page.
export const SHOW_CHAT_PAGE = false;

export const MICROSOFT_TEAMS_APP_ID = getEnvVar('VITE_MICROSOFT_TEAMS_APP_ID');

// Pagination
export const INVESTIGATIONS_LIMIT = 10;

// 
export const CHATWOOT_EMAIL_PREFIX = getEnvVar('VITE_CHATWOOT_EMAIL_PREFIX');
export const CHATWOOT_WEBTOKEN = getEnvVar('VITE_CHATWOOT_WEBTOKEN');
export const CHATWOOT_KEY = getEnvVar('VITE_CHATWOOT_KEY');