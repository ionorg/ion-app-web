FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# Serve dist

FROM caddy:2.1.1-alpine
ENV ENABLE_TELEMETRY="false"

WORKDIR /app
COPY --from=0 /app/dist /app/dist
