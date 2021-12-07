# ion-app-web

ion web app

### Screenshots

<img width="360" height="265" src=".github/screenshots/ion-01.jpg"/> <img width="360" height="265" src=".github/screenshots/ion-02.jpg"/>
<img width="360" height="265" src=".github/screenshots/ion-04.jpg"/> <img width="360" height="265" src=".github/screenshots/ion-05.jpg"/>

### Docker

Warning: **make sure ion is deployed by docker too**

#### Local hosting and auto ssl

Build docker image with production build of web app. erve on `https://localhost:9090`

Biz websocket is proxied using caddy server and docker network from ion.

```
docker network create ionnet
docker-compose -f docker-compose.yml up
```

Chat: [https://localhost:9090](https://localhost:9090)

Run this to rebuild when you modify the code
```
docker-compose -f docker-compose.yml up --build
```

#### Prod hosting and auto SSL

Enable production ports and Caddy file for web service in `docker-compose.prod.yml`.

Make sure these ports are exposed publicly

```
80/tcp
443/tcp
```

Configure your domain/email in docker-compose.prod.yml

```
WWW_URL=yourdomain
ADMIN_EMAIL=yourname@yourdomain
```

Bring up docker with

```
docker pull pionwebrtc/ion-app-web
docker network create ionnet
docker-compose -f docker-compose.prod.yml up
```

Chat: 

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

Chat: [https://localhost:8080](https://localhost:8080)


