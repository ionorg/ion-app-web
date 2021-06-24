FROM node:16-alpine

RUN alias python=python3
RUN apk add python3
RUN apk add python2
RUN apk add make
RUN apk add gcc
RUN apk add g++
RUN apk add git

WORKDIR /app

COPY package.json ./
RUN npm install

COPY public/ public/
COPY src/ src/
COPY styles/ styles/
COPY webpack.config.js .babelrc ./

RUN npm run build

# Serve dist

FROM caddy:2.1.1-alpine
ENV ENABLE_TELEMETRY="false"
#ENV WWW_URL=""
#ENV ADMIN_EMAIL=""

WORKDIR /app
COPY configs/certs/ /app/certs/
COPY --from=0 /app/dist /app/dist
