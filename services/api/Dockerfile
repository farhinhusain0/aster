# First phase - install monorepo's dependencies
FROM node:22.20.0-alpine AS builder

WORKDIR /app

# Copy root configuration files
COPY package.json yarn.lock nx.json tsconfig.*.json jest.preset.js jest.config.ts ./

# Copy local package and api package.json files for dependencies
COPY packages packages
COPY services/api/package.json ./services/api/

# Install dependencies - this layer will be cached if package files don't change
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy source files after dependency installation
COPY services/api services/api

# Build the API service
RUN npx nx build api --verbose

FROM node:22.20.0-alpine AS runner

COPY --from=builder /app/services/api/dist /app/services/api/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages /app/packages


WORKDIR /app/services/api/dist

# Run server
ENV NODE_PATH=./
CMD ["node", "src/server.js"]