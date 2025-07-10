FROM node:20.13.1-alpine AS node

ARG BUILD_VERSION
ENV API_VERSION=$BUILD_VERSION

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
RUN npm ci

COPY . /app/

ENV SERVER_PORT=80
ENV NODE_ENV=production

EXPOSE 80

CMD ["node", "main.cjs"]