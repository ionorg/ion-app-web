FROM node:lts-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY public/ public/
COPY src/ src/
COPY styles/ styles/
COPY webpack.config.js .babelrc ./

RUN npm run build

# Serve dist

FROM caddy:2.0.0-rc.3-alpine
ENV ENABLE_TELEMETRY="false"
RUN mkdir -p /app/
COPY --from=0 /app/dist /app/dist
