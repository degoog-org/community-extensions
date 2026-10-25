FROM node:22-alpine AS indexer

WORKDIR /app
COPY package.json stores.json ./
COPY scripts ./scripts
COPY assets/js/core/kinds.js ./assets/js/core/kinds.js
RUN node scripts/indexer/index.js

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY index.html store.html extension.html stores.json ./
COPY assets ./assets
COPY --from=indexer /app/data ./data

EXPOSE 80
