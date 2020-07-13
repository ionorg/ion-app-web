# Cafe CoffeeBeans
https://cafe.coffeebeans.io

The inhouse video conferencing tool for added security and branding. It is built using Pion Webrtc.

### Docker

Build docker image with production build of web app. Serve on `https://localhost:9090`

Biz websocket is proxied using caddy server and docker network from ion.

```
docker network create ionnet
docker-compose up --build
```

#### Remote Hosting / Auto SSL

Enable production ports and Caddy file for web service in `docker-compose.yml`.

Make sure these ports are exposed publicly

```
80/tcp
443/tcp
```

Configure your domain for production deployment. WWW_URL and ADMIN_EMAIL.

These variables can also be set in the `docker-compose.yml`.

#### Chat!

Bring up docker with

```
docker-compose up --build
```

Open your domain url with chrome


### Local Dev

#### Setup

Install node modules

```
npm i
```

#### Run

Start dev server

```
npm start
```

Serves on `https://localhost:8080`

### App wishlist

Find the app wishlist below to help contribute:
https://trello.com/b/kbghnOxw/videoconfappwishlist
