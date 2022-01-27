FROM node:16-alpine

# Configuration
WORKDIR /bot

# Build
COPY yarn.lock ./
COPY package.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn prisma:generate
RUN yarn build

# Run
CMD ["node", "."]