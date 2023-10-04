# Lite-Byte

A project that mostly serves as an excuse to play with NextJS 13, Prisma, React Server Components and Actions, and an LED matrix display.

## Local Development

- Clone the repo and install dependencies: `yarn`
- Copy `.env.sample` to `.env` and fill in required variables
- When working against a local database it will be created automatically for you with `docker compose up -d` using the environment variables above
- Start the dev server: `yarn dev` and visit `http://localhost:3001`

### Local Database Migrations

Once the database is up, you must grant additional privileges on it to allow Prisma to create migrations, if you need that:

- Make sure you've filled out the `.env` file already
- Start the database: `docker compose up -d`
- Get a shell on the docker container: `docker exec -it lite-byte-db-1 /bin/bash`
- Get a psql shell: `psql -U $POSTGRES_USER_FROM_ENV`
- Run these commands:
  ```sql
    ALTER USER $POSTGRES_USER_FROM_ENV WITH SUPERUSER;
    ALTER DEFAULT PRIVILEGES FOR USER $POSTGRES_USER_FROM_ENV IN SCHEMA public GRANT select, insert, update, delete ON TABLES TO $POSTGRES_USER_FROM_ENV
  ```
- `npx prisma migrate dev` should now work, if/when you need it
