# TKHO 预订系统前端（Vue + Vite）
FROM node:20-alpine AS builder

WORKDIR /app

COPY TKHO-frontend/package*.json ./

RUN npm ci

COPY TKHO-frontend/ .

ARG VITE_USE_SAME_ORIGIN_API=true
ARG NODE_ENV=production
ARG BUILD_TIMESTAMP

ENV VITE_USE_SAME_ORIGIN_API=$VITE_USE_SAME_ORIGIN_API
ENV NODE_ENV=$NODE_ENV

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo "ok" > /usr/share/nginx/html/health

COPY docker/nginx/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
