# Lite-Byte

A project that mostly serves as an excuse to play with NextJS 13, Prisma, React Server Components and Actions, and an LED matrix display.

The entire stack consists of:
- A NextJS client/server application which provides the web client and server
- A postgres database which stores user and device information
- A socket server which provides and bridges together:
  - A secure WebSocket server for realtime communication with the web client
  - A TCP socket server for realitime communication with the LED matrix display's controller.
  
## Authentication
This application uses JWT tokens signed/verified with a private/public key pair.  You **must** provide the private and public keys in the `.env` file as described in the `.env.sample`.  You can generate the public/private pair using these commands:
```bash
$ openssl genrsa -out keypair.pem 2048
# This is the public key portion
$ openssl rsa -in keypair.pem -pubout -out key-public.crt
# This is your private key, DO NOT SHARE IT!
$ openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in keypair.pem -out key-private.key
# Remove the source unless you have compelling (and safe!) place to keep it
$ rm keypair.pem
```
## Local Development

- Clone the repo and install dependencies: `yarn`
- Move into the `socket-server` directory and install its dependencies: `yarn`
- Copy `.env.sample` to `.env` and fill in required variables
- When working against a local database it will be created automatically for you with `docker compose up -d` using the environment variables above
- Start the dev server: `yarn dev`
- Start the socket server: `cd socket-server && yarn start` 
- and visit `http://localhost:3001`


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

## License
This repository is licensed under `GNU General Public License v3.0`.  See [COPYING](COPYING) for the permissions and requirements of this license.
