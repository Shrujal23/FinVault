# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE=/
ENV VITE_API_BASE=$VITE_API_BASE

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
WORKDIR /app

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
	&& chown -R appuser:appgroup /usr/share/nginx/html /var/cache/nginx /var/run \
	&& touch /var/run/nginx.pid \
	&& chown appuser:appgroup /var/run/nginx.pid

USER appuser
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]