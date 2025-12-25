# Dashboard Frontend

A React + TypeScript + Vite frontend application for Aster with runtime environment variable injection via separate configuration file.

## Environment Variables

This dashboard supports runtime environment variable injection, allowing you to configure the application without rebuilding the Docker image.

### How It Works

The dashboard uses a hybrid approach for environment variables:

1. **Development**: Uses Vite's built-in `import.meta.env` for environment variables
2. **Production**: Creates a separate `env.js` file with runtime environment variables accessible via `window.ENV` object

### Adding New Environment Variables

To add a new environment variable to the dashboard, follow these steps:

#### 1. Update `docker-entrypoint.sh`

Add your new environment variable to the `env.js` creation section:

```bash
cat > /usr/share/nginx/html/env.js << EOF
window.ENV = {
  VITE_API_SERVER_URL: '$(strip_quotes_and_expand "${DASHBOARD_API_URL}")',
  // ... existing variables ...
  VITE_YOUR_NEW_VARIABLE: '$(strip_quotes_and_expand "${YOUR_NEW_VARIABLE}")',
};
EOF
```

#### 2. Update `docker-compose.common.yml`

Add the environment variable to the dashboard service:

```yaml
dashboard-common:
  container_name: dashboard
  profiles: ["app"]
  environment:
    - DASHBOARD_API_URL
    # ... existing variables ...
    - YOUR_NEW_VARIABLE
  ports:
    - "${DASHBOARD_PORT}:80"
```

#### 3. Update `src/constants.ts`

Add the new variable to the TypeScript interface and export:

```typescript
// Update the global interface
declare global {
  interface Window {
    ENV?: {
      // ... existing variables ...
      VITE_YOUR_NEW_VARIABLE?: string;
    };
  }
}

// Export the constant
export const YOUR_NEW_CONSTANT = getEnvVar('VITE_YOUR_NEW_VARIABLE');
```

### Environment Variable Access

The application uses a helper function `getEnvVar()` that:

1. First checks `window.ENV` (runtime variables loaded from `env.js`)
2. Falls back to `import.meta.env` (build-time variables)
3. Returns a fallback value if neither is available

The `env.js` file is automatically loaded via a script tag injected into `index.html` during container startup.

Example usage:
```typescript
const apiUrl = getEnvVar('VITE_API_SERVER_URL') || 'http://localhost:3000';
```

### Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_SERVER_URL` | API server URL | `${window.location.origin}/api` |
| `VITE_API_TUNNEL_URL` | API tunnel URL for development | - |
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth client ID | - |
| `VITE_SLACK_CLIENT_ID` | Slack OAuth client ID | - |
| `VITE_NOTION_CLIENT_ID` | Notion OAuth client ID | - |
| `VITE_ATLASSIAN_CLIENT_ID` | Atlassian OAuth client ID | - |
| `VITE_PAGER_DUTY_CLIENT_ID` | PagerDuty OAuth client ID | - |
| `VITE_CHATWOOT_EMAIL_PREFIX` | Chatwoot email prefix | - |
| `VITE_CHATWOOT_WEBTOKEN` | Chatwoot web token | - |
| `VITE_CHATWOOT_KEY` | Chatwoot API key | - |
| `VITE_MOCK_API_CALLS` | Enable API mocking | `false` |
| `VITE_MICROSOFT_TEAMS_APP_ID` | Microsoft Teams app ID | - |

### Development

```bash
npm run dev
```

Environment variables in development are loaded from:
1. `.env` files (via Vite)
2. System environment variables

### Production

Environment variables are injected at container runtime via the entrypoint script. Set them when running the container:

```bash
docker run -e DASHBOARD_API_URL="https://api.example.com" your-dashboard-image
```

### Architecture

The runtime injection works by:

1. **Container startup**: `docker-entrypoint.sh` runs
2. **Environment file creation**: Creates separate `env.js` file with `window.ENV` object
3. **HTML modification**: Uses `sed` to add `<script src="/env.js"></script>` tag to `index.html`
4. **Application access**: Frontend reads from `window.ENV` or falls back to `import.meta.env`

This approach provides:
- ✅ Runtime configuration without rebuilds
- ✅ Clean separation of environment configuration from application bundle
- ✅ Easy runtime updates of environment variables
- ✅ Development/production compatibility
