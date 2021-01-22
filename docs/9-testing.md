# [Front-end from none to Angular](../README.md)

## 9. Testing

- [Prerequisites](#prerequisites)

- [Unit](#unit)
- [Integration](#integration)
- [System](#system)
- [Exercise](#exercise)

- [Next](#next)

---

## Prerequisites

same as [3-docker](3-docker.md) and [8-docker](8-docker.md)

---

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

```shell
docker-compose up --build test
docker-compose down
```

---

## Exercise

TBD

---

## Next

it never ends :)
