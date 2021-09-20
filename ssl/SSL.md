# SSL

The gateway (container) can be configured with SSL using Nginx. This uses
the official Nginx docker container without modification.

## 1. Obtain a certificate

The SSL certificate can be self-signed or signed by a CA.

To generate a self-signed certificate for local testing (i.e. on localhost),
you'll need to create the root CA certificate yourself and explicitly trust it.

How this is done differs depending on your platform. Here is a
[guide for macOS](https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/)
which requires the root CA to be loaded into the macOS "keychain".

## 2. Configure your SSL settings

A [template](./docker/nginx/templates/default.conf.template) has been provided
which will be loaded into the Nginx docker container:

```nginx
server {
    listen 443 ssl;
    server_name         ${NGINX_SERVER_NAME};
    ssl_certificate     /etc/nginx/server.crt;
    ssl_certificate_key /etc/nginx/server.key;
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://${NGINX_PROXY_HOST}:${NGINX_PROXY_PORT};
    }

    location /events {
        proxy_pass http://${NGINX_PROXY_HOST}:${NGINX_PROXY_PORT}/events;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

The template provides basic SSL configuration, including support for
websockets. For more advanced SSL configuration, see
[Configuring HTTPS servers](http://nginx.org/en/docs/http/configuring_https_servers.html).

## 3. Configuring the Nginx container

You will note the environment variables in the above template, for example:
```nginx
server_name         ${NGINX_SERVER_NAME};
```

These are required at runtime to configure Nginx properly. They provide the
server name linked to the SSL certificate (`NGINX_SERVER_NAME`) and the
gateway host (`NGINX_PROXY_HOST`) plus port (`NGINX_PROXY_PORT`).

We have provided an [example docker compose file](./docker-compose.yml)
for running the containers:
```yml
version: '3.9'

services:
  gateway:
    image: aemocontainerregistry.azurecr.io/dsb/client-gateway:canary
    environment:
      - DSB_BASE_URL=https://dsb-dev.energyweb.org
  nginx:
    image: nginx:stable
    volumes:
      - ./templates:/etc/nginx/templates
      - ./server.crt:/etc/nginx/server.crt
      - ./server.key:/etc/nginx/server.key
    ports:
      - 443:443
    environment:
      - NGINX_SERVER_NAME=${NGINX_SERVER_NAME}
      - NGINX_PROXY_HOST=${NGINX_PROXY_HOST}
      - NGINX_PROXY_PORT=${NGINX_PROXY_PORT}
```

This will spin up the gateway and Nginx containers side-by-side, using an
`.env` file to (automatically) load the environment variables. An
[`.env.example`](./env.example) file has been provided, wich can be copied to `.env`:

```
cp .env.example .env
```

The example variables provided assume a self-signed certificate is being used
for local testing. They should be changed to match your own environment:
```sh
# server name for which the SSL cert was issued for
# (e.g. example.domain.com)
NGINX_SERVER_NAME=localhost

# replace with private IP of gateway container
# (unless running in provided docker compose setup)
NGINX_PROXY_HOST=gateway

# port the gateway will be accessible on (private IP only)
NGINX_PROXY_PORT=3000
```

There are a few things to note here:

- The gateway container does not expose any ports publicly (note how there is
no `services.gateway.port`). All traffic goes through Nginx (port 443).
- In the example configuration, the network created with docker compose allows
us to simply specify `gateway` as our `NGINX_PROXY_HOST`, which points to the
private IP of the service in `services.gateway` (i.e. DNS lookup).
- In this configuration, we have a self-signed certificate for local testing.
For this reason, the `NGINX_SERVER_NAME` is `localhost`, such that we can
access `https://localhost`. This should be replaced with your own server host
name.
- The mounts specified in `services.nginx.volumes` follow the format
`{HOST}:{CONTAINER}`. The paths must correctly point to the host `template`
directory and your own public certificate (e.g. `server.crt`) and
private key (`server.key`).

In summary, you should now have a setup that looks like so:
```
.
├── docker-compose.yml
├── server.crt
├── server.key
└── templates
    └── default.conf.template
```

## 4. Running the containers

To run the Nginx and DSB Client Gateway containers:
```
docker-compose up
```

You should now be able to access the gateway on https://localhost
(if using this setup) or `https://{NGINX_SERVER_NAME}`.

Note that some browsers (such as Firefox) may not trust a self-signed
certificate, or one where it doesn't know the intermediate certificate.
See the section "SSL certificate chains" on
[Configuring HTTPS Servers](http://nginx.org/en/docs/http/configuring_https_servers.html)
for a solution to this.
