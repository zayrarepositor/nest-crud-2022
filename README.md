<p align="center">
Bookmarks app
</p>

## Description

Nest + Typescript + Prisma + Docker + Jest + Pactum

## Scripts: Installation

```bash
$ npm install

```

## Scripts: Running docker db and prisma

```bash
# development
# docker remove and compose up and prisma migrate deploy
$ npm run db:dev:restart

# running prisma
$ npm run prisma:dev

# testing
# docker remove and compose up and prisma migrate deploy
$ npm run db:test:restart

# running prisma
$ npm run prisma:test

```

## Running the app

```bash
# development watch mode
$ npm run start:dev

```

## Test

```bash
# e2e tests watch mode
$ npm run test:e2e

```
