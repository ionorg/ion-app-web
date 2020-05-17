# ion-app-web

ion web app

### Screenshots

<img width="360" height="265" src=".github/screenshots/ion-01.jpg"/> <img width="360" height="265" src=".github/screenshots/ion-02.jpg"/>
<img width="360" height="265" src=".github/screenshots/ion-04.jpg"/> <img width="360" height="265" src=".github/screenshots/ion-05.jpg"/>

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

Configure your domain.

```
export WWW_URL=yourdomain
export ADMIN_EMAIL=yourname@yourdomain
```

These variables can also be set in the `docker-compose.yml`.

#### Chat!

Bring up docker with

```
docker-compose up --build
```

Open this url with chrome

```
https://yourdomain
```

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
