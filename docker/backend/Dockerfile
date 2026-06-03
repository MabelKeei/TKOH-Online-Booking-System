# TKHO 预订系统后端（NestJS + Prisma）
# 构建上下文：项目根目录
FROM node:20-alpine AS builder

WORKDIR /app

COPY TKHO-backend/package*.json ./
COPY TKHO-backend/prisma ./prisma/

RUN npm ci

COPY TKHO-backend/ .

RUN rm -rf dist tsconfig.build.tsbuildinfo && \
    npx prisma generate && \
    npm run build && \
    test -f dist/main.js && \
    test -f dist/ev-management/ev-management.controller.js

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache curl

COPY TKHO-backend/package*.json ./
COPY TKHO-backend/prisma ./prisma/

RUN npm ci --omit=dev && npm install prisma@6.16.2 --no-save && npx prisma generate

COPY --from=builder /app/dist ./dist

COPY docker/backend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3210

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://127.0.0.1:3210/api/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
