FROM node:10-alpine as base

ENV PATH /opt/node_app/node_modules/.bin/:$PATH

RUN apk update && apk add --no-cache docker-cli

ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT 9229 9230

# This application needs to interact with the Docker engine
# which complicates running node as an unprivileged account.
# TODO: figure out if there's a secure way to run this
# under the node account while still interacting with the Docker API
RUN mkdir /opt/node_app/app -p
# && chown -R node:node /opt/node_app
WORKDIR /opt/node_app
# USER node
COPY package*.json ./

RUN npm install --only=production \
    && npm cache clean --force

WORKDIR /opt/node_app/app

# DEV IMAGE
FROM base as dev

ENV NODE_ENV=development

RUN npm install --only=development

CMD ["nodemon", "--exec", "babel-node", "./src/start"]

# BUILD IMAGE
FROM dev as builder

COPY . .

RUN npm run build

# PROD Image
FROM builder as prod

ENV NODE_ENV=production

CMD ["node", "./dist/start.js"]
