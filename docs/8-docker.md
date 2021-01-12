# [Front-end from none to Angular](../README.md)

## 8. Docker

- [Prerequisites](#prerequisites)

- [Prototype](#prototype)

- [Dockerfile](#dockerfile)

- [Docker compose](#docker-compose)

- [Production](#production)

- [References](#references)

- [Exercise](#exercise)

- [Next](#next)

---

## Prerequisites

- [Docker desktop](https://www.docker.com/products/docker-desktop) (verify installation with `docker version`)
- VS Code extension [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
- VS Code extension [Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

---

## Prototype

Build, test and run in docker

### Step 1 - clear app

- `cd hub`
- `rd /s/q node_modules & rd /s/q dist`

### Step 2 - create services network

- verify if host `host.docker.internal` points to localhost in `C:\Windows\System32\drivers\etc` (or just create a fake DNS name)
- replace `localhost` from `./hub/src/proxy.conf.json` with the fake DNS name

### Step 3 - run app inside a `node:14.15.4` container

- `docker pull node:14.15.4`
- `docker run --rm -it -v %CD%:/hub -w /hub -p 4200:80 node:14.15.4 bash`
- `npm i` => `npm i -g npm@latest`
- `ng build` => `npm i -g @angular/cli` => `npm update`
- `ng serve --host 0.0.0.0 --port 80`

### Step 4 - run backend separately in a new `node:14.15.4` container

- `cd hub`
- `docker run --rm -it -v %CD%:/hub -w /hub -p 3000:80 node:14.15.4 bash`
- `npm run json-server` => `npm i -g json-server`
- `json-server --watch src/mocks/db.json --host 0.0.0.0 --port 80`

## Dockerfile

Put it all together in a reproduceable env

- create file `.dockerignore`

```dockerignore
dist
node_modules
.editorconfig
.gitignore
dockerfile
```

- create file `dockerfile`

### Image for the client

- add instructions to build, test and serve the client

```dockerfile
FROM node:14.15.4 AS client
RUN npm i -g @angular/cli@8
WORKDIR /hub

COPY ./package.json .
RUN npm i

COPY ./.browserslistrc ./tslint.json ./tsconfig.app.json ./tsconfig.json ./angular.json ./
COPY ./src/ ./src/
RUN ng build --prod

COPY ./tsconfig.spec.json ./karma.conf.js ./
COPY ./e2e/ ./e2e/
# RUN npm run test
# RUN npm run e2e

EXPOSE 80
CMD ng serve --host 0.0.0.0 --port 80
```

- build and tag the image: `docker build --target client -t hub_client .`
- verify it exists `docker image ls`
- run the image `docker run --rm -p 4200:80 hub_client`

### Image for the server

- add instructions to run the server

```dockerfile
FROM node:14.15.4 AS server
RUN npm i -g json-server
WORKDIR /hub

COPY ./src/mocks/ ./src/mocks/

EXPOSE 80
CMD json-server src/mocks/db.json --host 0.0.0.0 --port 80
```

- build and tag the image: `docker build --target server -t hub_server .`
- verify it exists `docker image ls`
- run the image `docker run --rm -it -p 3000:80 hub_server`

---

## Docker compose

Let's "orchestrate" the build and run of these linked images

- create file `docker-compose.yml`

```yml
version: '3.8'

services:

    client:
        container_name: 'client'
        build:
            context: .
            dockerfile: ./dockerfile
            target: client
        depends_on:
            - server
        ports:
            - 4200:80
        restart: always

    server:
        container_name: 'server'
        build:
            context: .
            dockerfile: ./dockerfile
            target: server
        ports:
            - 3000:80
        restart: always
```

- double check indentation !!! in yaml, one space off will cause the compiler to not interpret it correctly !!!

- add `docker-compose.yml` to `.dockerignore`

- (build and) start services `docker-compose up --build --remove-orphans`

- stop `docker-compose down`

---

## Production

- split `dockerfile` into two files `dockerfile.client` and `dockerfile.server` and keep only the relevant instructions in each

- update `.dockerignore`, add the new files

- update `services/[service]/build/dockerfile` for each in `docker-compose.yml`

### Client: split client into two stages: `build` and `run`

- change `AS client` to `AS build`

- remove `EXPOSE` and `CMD`

- update `angular.json` / `projects/hub/architect/build/options/outputPath` to just `dist`

- add a closer to production runtime image `nginx`

```dockerfile
FROM nginx AS run
COPY --from=build /hub/dist/* /usr/share/nginx/html/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- create the configuration for the server as `nginx.conf`

```conf
server { 
    listen 80;
    server_name frontend;

    location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;
    }

    location /apps {
        proxy_pass http://server:3000/apps;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-NginX-Proxy true;
        proxy_ssl_session_reuse off;
        proxy_set_header Host $http_host;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    location /types {
        proxy_pass http://server:3000/types;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-NginX-Proxy true;
        proxy_ssl_session_reuse off;
        proxy_set_header Host $http_host;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }
}
```

- change `docker-compose.yml` / `services/client/build/target` to `run`

- test it `docker-compose up --build` => partial success

### Server

- change the server internal port from 80 to 3000 in `dockerfile.server` (two places)

- remove the server port binding in `docker-compose.yml` / `services/server/ports` (and subsection)

- test it again `docker-compose up --build` => success

- notice how `http://localhost:3000` can no longer be accessed directly, because in our "production" version of the app, the server isn't meant for public usage

- move `mocks` folder beside `src` folder (and replace the path in package.json)

- now changes to db won't trigger client rebuild, because this isn't part of client source files

- replace `COPY ./src/mocks/ ./src/mocks/` with `VOLUME [ "/hub/mocks/db.json" ]` in `dockerfile.server`

- add a new section in `docker-compose.yml` / `services/server`

```yaml
        volumes:
            - ./mocks/db.json:/hub/mocks/db.json
```

- test it again `docker-compose up --build` => success

- now changes done to our db through CRUD endpoints of json-server will survive docker start/stop/rm, since the image does not embed the db file

---

## References

### [Docker CLI](https://docs.docker.com/engine/reference/commandline/cli/)

```none
Add    docker  pull  IMAGE  
       docker  network  create  NTEWORK  
           => docker  run  --name  NAME  --network  NTEWORK  IMAGE  
           => docker  run  -h  NAME  --network  NTEWORK  IMAGE  
       docker  volume  create  VOLUME  

List   docker  image  ls
       docker  container  ls  -a  -s  
       docker  network  ls  
       docker  volume  ls  

Del    docker  image  rm  IMAGE  
       docker  container  rm  CONTAINER  
       docker  network  rm  NETWORK  
       docker  volume  rm  VOLUME  

Run    docker  run  IMAGE  
       docker  run  --rm  IMAGE  
       docker  run  -d  IMAGE  
       docker  run  -it  IMAGE  COMMAND  
       docker  run  -p  HOST_PORT : CONTAINER_PORT  IMAGE  
       docker  run  -v  HOST_DIR : CONTAINER_DIR  IMAGE  
       docker  run  -v  VOLUME : CONTAINER_DIR  IMAGE  
       docker  run  -w  CONTAINER_DIR  IMAGE  
       docker  run  -e  ENV_VAR_NAME=ENV_VAR_VALUE  IMAGE  

Start  docker  container  start  -i  CONTAINER  

Exec   docker  exec  CONTAINER  COMMAND  
       docker  exec  -it  CONTAINER  COMMAND  

Stat  docker  inspect  CONTAINER  

Stop   docker  stop  CONTAINER  

Clean  docker container prune [--force]
       docker image prune [--force]
       docker network prune [--force]
       docker volume prune [--force]
       docker  system  prune  [-a]
```

---

### [Dockerfile](https://docs.docker.com/engine/reference/builder/)

---

### [Docker compose CLI](https://docs.docker.com/compose/reference/overview/)

```none
docker-compose up [service]
docker-compose down [service]
```

---

## Exercise

[Docker for Web Developers](https://app.pluralsight.com/library/courses/docker-web-development) - 5h 38m

---

## Next

[Testing](9-testing.md)
