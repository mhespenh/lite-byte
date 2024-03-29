# Lite-Byte

![6DEF0157-55BD-4E15-89F8-94529079B14C_1_102_o](https://github.com/mhespenh/lite-byte/assets/1562473/6ac53f2f-57ed-470d-9769-99ff2a083e81)

## About
A project that mostly serves as an excuse to play with NextJS 13, Prisma, React Server Components and Actions, WebSockets, and an LED matrix display.

The entire stack consists of:
- A NextJS client/server application which provides the web client and server
- A postgres database which stores user and device information
- A socket server which provides a secure WebSocket server for realtime communication with the web client
- An MQTT broker ([EMQX](https://www.emqx.com/en)) for realitime communication with the LED matrix display's controller.  
- A 64x32 LED matrix display
- An MatrixPortal M4 display and networking board

## Video Walkthrough
<a href="http://www.youtube.com/watch?feature=player_embedded&v=eYDX1Hv6SPM" target="_blank">
 <img src="https://img.youtube.com/vi/eYDX1Hv6SPM/hqdefault.jpg" alt="Watch the video" />
</a>

## Hardware and Firmware
The hardware for this project consists of:
- A 64x32 pixel LED matrix display ([Adafruit](https://www.adafruit.com/product/2279))
- A MatrixPortal M4 display controller ([Adafruit](https://www.adafruit.com/product/4745))
- A quick-and-dirty custom box

The firmware for the display controller is built on:
- CircuitPython ([circuitpython.org](https://circuitpython.org))
- Several Adafruit libraries available [here](https://learn.adafruit.com/welcome-to-circuitpython/circuitpython-libraries), including:
  - [MiniMQTT](https://github.com/adafruit/Adafruit_CircuitPython_MiniMQTT) for MQTT client support
  - [ESP32SPI](https://github.com/adafruit/Adafruit_CircuitPython_ESP32SPI) for networking
  - [MatrixPortal](https://github.com/adafruit/Adafruit_CircuitPython_MatrixPortal) for display driving

The firmware for the MatrixPortal M4 is included in the repo under `lite-byte-firmware/` along with a stub `secrets.py` file you have to fill in.  You must also follow the Adafruit instructions [here](https://learn.adafruit.com/welcome-to-circuitpython/circuitpython-libraries) to configure CircuitPython and include all the libs imported at the top of `code.py`

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
- You will now find:
  - The web app running at http://localhost:3000
  - EMQX MQTT message broker listening on mqtt:localhost:1883
  - EMQX Web Dashboard at http://localhost:18083 (default user/pass: admin/public)
  - A WebSocket server running at ws://localhost:8443

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

## Deployment Details
The WebSocket runs as a separate Node app, the code for which is located in `socket-server/`.  The MQTT broker server, EMQX, is a self-contained docker image.

There is a `Dockerfile.socket-server` and `docker-compose.yml` in the project root which can be used to build and run the two servers.  

Before you build you **MUST** add a valid SSL certificate and key pair that can be used for the secure websocket server to the project root called: `socket-server-cert.pem` and `socket-server-key.pem`.  In my case they come from LetsEncrypt so to run the server I would clone the repo on my server and run:
```sh
$ git clone git@github.com:mhespenh/lite-byte.git
$ cd lite-byte
$ sudo cp /etc/letsencrypt/live/mhespenh.com/fullchain.pem socket-server-cert.pem
$ sudo cp /etc/letsencrypt/live/mhespenh.com/privkey.pem socket-server-key.pem
$ docker compose build
$ docker compose up -d
```

## License
This repository is licensed under `GNU General Public License v3.0`.  See [COPYING](COPYING) for the permissions and requirements of this license.
