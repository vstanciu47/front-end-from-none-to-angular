# [Front-end from none to Angular](../README.md)

## 9. Testing

- [Prerequisites](#prerequisites)

- [Reorganize](#reorganize)
- [Unit](#unit)
- [Integration](#integration)
- [System](#system)
- [Exercise](#exercise)

- [Next](#next)

---

## Prerequisites

same as [3-docker](3-docker.md) and [8-docker](8-docker.md)

---

## Reorganize

It starts to get crowded in `hub` folder, we have both `client` and our fake `server` and we'll add another folder to contain the new test project.  
So let's split the projects first:

- create `server` folder and move `mocks` folder and `dockerfile.server`
- rename `server/dockerfile.server` to `server/dockerfile`
- edit `server/dockerfile` and replace volume `/hub/mocks/db.json` with `/hub/server/mocks/db.json`

- create `client` folder and move everything apart from `.dockerignore`, `.gitignore`, `docker-compose.yml`
- rename `client/dockerfile.client` to `client/dockerfile`
- edit `client/dockerfile` and replace all `COPY ./` with `COPY ./client/`; pay attention to lines 8 and 12, those are copying multiple files

- edit `docker-compose.yml`

```yaml
services:
  client:
    build:
      dockerfile: ./client/dockerfile

  server:
    build:
      dockerfile: ./server/dockerfile
    volumes:
      - ./server/mocks/db.json:/hub/mocks/db.json
```

- edit `.dockerignore`

```.dockerignore
**/dist
**/node_modules
**/.editorconfig
**/.gitignore
**/dockerfile
**/docker-compose.yml
```

- verify it still works `docker-compose up --build` => ensure `http://localhost:4200` works

## Unit

### Client unit tests

`docker-compose build client` => enable `npm run test` step

### Server unit tests

`docker-compose build server` => would include something similar to `npm run test`, but we have a fake server, no point test it

---

## Integration

### Client integration tests

`docker-compose build client` => enable `npm run e2e` step

### Server integration tests

`docker-compose build server` => would include something similar to `npm run e2e`, but we have a fake server, no point test it

---

## System

### Local

- create a new folder `test`
- ...

### Docker

#### Docker prerequisites

##### Docker 'bridge' network

In the docker workshop, in production subsection, we've set up two services `client` and `server` that are able to communicate between them.  
This was possible because docker asigned them to a default shared subnet.  
But we have to limit the communication between services; for this we use networks and group services under common networks.  
For our small solution, we only need one network that is used for client's needs to access the server.
Let's define one now, and add it to both services in `docker-compose.yml`:

```yaml
services:
  client:
    networks:
      - client

  server:
    networks:
      - client

networks:
  client:
    driver: bridge
```

The `driver: bridge` can be omitted, it is the default option; this basically puts the services under the same subnet.  
Now when we run `docker-compose up`, a network named `hub_client` is created and used.  
Did you notice that `networks` is an array? Well, every service can have as many networks as it needs; for example if `server` would need to communicate with a `db` service, then these two can do so using a separate network (so that `client` won't be able to communicate with `db`) - this is a security measure.

##### Docker 'host' network

The 'host' network driver puts the consuming service on the same network as the host.  
So far, if we want to access the `client` network (in browser) we can do so using `http://localhost:4200`; this is possible because the `client` service publishes port 4200, meaning it forwards the container's port to the host's port 4200.  
Let's start a new container and try to access this URL from it: `docker run --rm node:14.15.4 curl http://localhost:4200` => FAIL; that's because in the container, `localhost` is the container's localhost, not the host's.  
If we want to reach the host's `localhost`, we have to put the container on the host's network; we do this by using `--net host`.  
Let's try it again: `docker run --rm --net host node:14.15.4 curl http://localhost:4200` => SUCCESS.  

#### Docker prototype

Let's ensure the test container can access the host's network just like a user would, same as we did in previous section:

- create `test/dockerfile`

```dockerfile
FROM node:14.15.4
CMD curl http://localhost:4200
```

- create a new `docker-compose.test.yml` file beside the existing one

```yaml
version: "3.8"

services:
  test:
    container_name: "test"
    build:
      context: .
      dockerfile: ./test/dockerfile
    depends_on:
      - client
      - server
    network_mode: host
```

- start the extra `test` service: `docker-compose -f docker-compose.yml -f docker-compose.test.yml up --build test` => SUCCESS, it logs our app's index.html

#### Docker test

By now you should have ALL the information necesary to move the local testing in Docker.  
See [exercise](#exercise) section, this is your graduation exersice :)

---

## Exercise

- unit testing
  - TBD

- integration testing
  - TBD

- system level testing
  - wipe the demo `test/dockerfile` and add all necesary info to run tests in a container, exactly the same as they did locally

---

## Next

it never ends :)
