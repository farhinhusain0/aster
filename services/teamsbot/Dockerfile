# First phase - install monorepo's dependencies
FROM node:22.20.0-alpine as dependencies

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
COPY nx.json ./
COPY tsconfig.*.json ./
COPY jest.preset.js ./
COPY jest.config.ts ./

# IMPORTANT: Copy internal libraries
COPY packages packages
COPY services/teamsbot services/teamsbot

RUN yarn install --frozen-lockfile --network-timeout 100000

RUN npx nx build teamsbot --verbose

WORKDIR /app/services/teamsbot/dist

# Run server
CMD ["node", "app.js"]