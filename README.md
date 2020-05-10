# ion-app-web
ion web app

### Docker
Build docker image with production build of web app. Serve on `https://localhost:9090`

Biz websocket is proxied using caddy server and docker network from ion.

```
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
For node dev server the client must be modified for the biz socket.

Edit `App.jsx` and update client config

Change
```
let client = new Client({url: "wss://" + window.location.host});
```

To

```
// for dev by scripts
// let client = new Client({url: "wss://" + window.location.hostname + ":8443"});
```


#### Run
Start dev server
```
npm start
```

Serves on `https://localhost:8080`
