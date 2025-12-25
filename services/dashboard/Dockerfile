# This Dockerfile builds and serves the dashboard frontend application using a multi-stage build process

# Stage 1: Build Stage
# Use Node.js Alpine image for a smaller footprint while building the application
FROM node:22.20.0-alpine as builder

# Set working directory for all build steps
WORKDIR /app

# Copy package files and workspace configuration
# These files are copied first to leverage Docker layer caching for dependencies
COPY package.json ./
COPY yarn.lock ./
COPY nx.json ./
COPY tsconfig.*.json ./
COPY jest.preset.js ./
COPY jest.config.ts ./

# Copy shared packages used across the monorepo
# These need to be copied before installing dependencies since they may be referenced
COPY packages packages

# Copy dashboard-specific package files
# Separate copy commands allow better cache utilization
COPY services/dashboard/package.json services/dashboard/package.json
COPY services/dashboard/yarn.lock services/dashboard/yarn.lock

# Install all dependencies
# --frozen-lockfile ensures consistent installs
# --network-timeout handles slow network conditions
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy dashboard source code
# This is done after dependency installation to prevent unnecessary rebuilds
COPY services/dashboard services/dashboard

# Build the dashboard application using NX
RUN npx nx build dashboard --verbose

# Stage 2: Production Stage
# Use NGINX Alpine for a minimal production image
FROM nginx:alpine AS production

# Install gettext package for envsubst
# This is needed to substitute environment variables at runtime
RUN apk add --no-cache gettext

# Copy built assets from builder stage
# The dist folder contains the compiled frontend application
COPY --from=builder /app/services/dashboard/dist /usr/share/nginx/html
# Copy NGINX configuration for serving the frontend
COPY --from=builder /app/services/dashboard/nginx.conf /etc/nginx/conf.d/default.conf

# Copy and prepare the entrypoint script
# This script generates runtime environment configuration and starts NGINX
COPY services/dashboard/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Document that the container listens on port 80
EXPOSE 80

# Configure container startup
# The entrypoint script handles environment variable injection
ENTRYPOINT ["/docker-entrypoint.sh"]

# Start NGINX in foreground mode
# daemon off ensures NGINX stays in foreground and container remains running
CMD ["nginx", "-g", "daemon off;"]