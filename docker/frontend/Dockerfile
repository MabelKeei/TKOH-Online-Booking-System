# TKHO 预订系统前端（Vue + Vite）
FROM node:20-alpine AS builder

WORKDIR /app

COPY TKHO-frontend/package*.json ./

RUN npm ci

COPY TKHO-frontend/ .

ARG VITE_USE_SAME_ORIGIN_API=true
# Docker 走入口 Nginx 同源 /api，勿 baked Netlify/ngrok 的 VITE_API_ORIGIN
ARG VITE_API_ORIGIN=
ARG NODE_ENV=production
ARG BUILD_TIMESTAMP

ENV VITE_USE_SAME_ORIGIN_API=$VITE_USE_SAME_ORIGIN_API
ENV VITE_API_ORIGIN=$VITE_API_ORIGIN
ENV NODE_ENV=$NODE_ENV

RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo "ok" > /usr/share/nginx/html/health

COPY docker/nginx/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=5 \
  CMD curl -f http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
