# [Front-end from none to Angular](../README.md)

## 8. Docker

- [Prerequisites](#prerequisites)

- [Prototype](#prototype)

- [Dockerfile](#dockerfile)

- [Docker compose](#docker-compose)

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
- `docker run --rm -it -v %CD%:/hub -w /hub -p 4200:80 node bash`
- `npm i` => `npm i -g npm@latest`
- `ng build` => `npm i -g @angular/cli` => `npm update`
- `ng serve --host 0.0.0.0 --port 80`

### Step 4 - run backend separately in a new `node:14.15.4` container

- `cd hub`
- `docker run --rm -it -v %CD%:/hub -w /hub -p 3000:80 node bash`
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
- run the image `docker run --rm -it -p 4200:80 hub_client`

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

- (build and) start services `docker-compose up --build --remove-orphans`

- stop `docker-compose down`

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
