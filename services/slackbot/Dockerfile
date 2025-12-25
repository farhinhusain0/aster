# Builder stage
FROM node:22.20.0-alpine as builder

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
COPY nx.json ./
COPY tsconfig.*.json ./
COPY jest.preset.js ./
COPY jest.config.ts ./

# Copy internal libraries
COPY packages packages
COPY services/slackbot services/slackbot

# Install dependencies and build
RUN yarn install --frozen-lockfile --network-timeout 100000
RUN npx nx build slackbot --verbose

# Prune dev dependencies
RUN yarn install --production --ignore-scripts --prefer-offline

# Runner stage
FROM node:22.20.0-alpine as runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/slackbot/dist ./services/slackbot/dist

WORKDIR /app/services/slackbot/dist

# Run server
CMD ["node", "app.js"]