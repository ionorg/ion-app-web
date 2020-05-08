FROM node:lts-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY webpack.config.js .babelrc ./


COPY dist/ dist/
COPY src/ src/
COPY styles/ styles/

RUN npm run build


FROM caddy:2.0.0-rc.3-alpine
ENV ENABLE_TELEMETRY="false"
RUN mkdir -p /app/
COPY --from=0 /app/dist /app/dist
