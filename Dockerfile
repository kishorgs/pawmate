# PawMate API — production image (non-root)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
RUN npm ci --workspace=apps/backend --include-workspace-root
COPY config ./config
COPY apps/backend ./apps/backend
RUN npm run build -w apps/backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 pawmate && adduser -u 1001 -G pawmate -S pawmate
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/config ./config
COPY --from=builder /app/package.json ./package.json
USER pawmate
EXPOSE 4000
CMD ["node", "apps/backend/dist/main.js"]
