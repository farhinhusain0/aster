#!/bin/sh
set -e

# This entrypoint script serves two main purposes:
# 1. Generate runtime environment variables for the frontend application via env.js
# 2. Start the nginx server that will serve the static frontend files

# The environment variable injection system works as follows:
# 1. A separate env.js file is created containing the window.ENV configuration
# 2. This file is placed in the nginx static files directory
# 3. A script tag is added to index.html to load env.js
# 4. The frontend application can then access these variables via window.ENV
#
# This approach has several benefits:
# - Keeps environment configuration separate from the main application bundle
# - Allows for easy runtime updates of environment variables
# - Maintains clean separation of concerns
# - Follows common patterns for runtime configuration in static web apps

# The strip_quotes_and_expand function handles two important tasks:
# 1. Removes any surrounding quotes from environment variable values
# 2. Expands any nested environment variables using envsubst
# This is necessary because Docker environment variables may contain quotes
# or reference other environment variables that need to be expanded
strip_quotes_and_expand() {
  # First strip quotes, then expand variables using envsubst
  local value=$(echo "$1" | sed 's/^"\(.*\)"$/\1/')
  echo "$value" | envsubst
}

# Create env.js file with environment variables
# This file will be served by nginx and loaded by the frontend application
# The file is created in the nginx static files directory
# Each environment variable is processed through strip_quotes_and_expand to:
# - Remove any quotes that Docker may have added
# - Expand any nested environment variables
cat > /usr/share/nginx/html/env.js << EOF
window.ENV = {
  VITE_API_SERVER_URL: '$(strip_quotes_and_expand "${DASHBOARD_API_URL}")',
  VITE_API_TUNNEL_URL: '$(strip_quotes_and_expand "${API_TUNNEL_URL}")',
  VITE_GITHUB_CLIENT_ID: '$(strip_quotes_and_expand "${GITHUB_CLIENT_ID}")',
  VITE_SLACK_CLIENT_ID: '$(strip_quotes_and_expand "${SLACK_CLIENT_ID}")',
  VITE_NOTION_CLIENT_ID: '$(strip_quotes_and_expand "${NOTION_CLIENT_ID}")',
  VITE_ATLASSIAN_CLIENT_ID: '$(strip_quotes_and_expand "${ATLASSIAN_CLIENT_ID}")',
  VITE_PAGER_DUTY_CLIENT_ID: '$(strip_quotes_and_expand "${PAGER_DUTY_CLIENT_ID}")',
  VITE_CHATWOOT_EMAIL_PREFIX: '$(strip_quotes_and_expand "${CHATWOOT_EMAIL_PREFIX}")',
  VITE_CHATWOOT_WEBTOKEN: '$(strip_quotes_and_expand "${CHATWOOT_WEBTOKEN}")',
  VITE_CHATWOOT_KEY: '$(strip_quotes_and_expand "${CHATWOOT_KEY}")',
  VITE_MOCK_API_CALLS: '$(strip_quotes_and_expand "${MOCK_API_CALLS}")',
  VITE_MICROSOFT_TEAMS_APP_ID: '$(strip_quotes_and_expand "${MICROSOFT_TEAMS_APP_ID}")',
};
EOF

# Add script tag to load env.js in index.html
# The script is added to the head section to ensure it loads before the application code
# This ensures environment variables are available when the application initializes
sed -i "s|</head>|  <script src=\"/env.js\"></script>\n  </head>|" /usr/share/nginx/html/index.html

# Start nginx using the command passed to docker run
# The exec ensures nginx runs as PID 1 and can receive signals properly
# This is important for proper container lifecycle management
exec "$@"