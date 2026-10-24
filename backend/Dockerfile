# Backend Service — Node.js/Express (mục 3.2.2 báo cáo)
# Dùng PostgreSQL (pg thuần JS) nên bỏ qua better-sqlite3 -> không cần trình biên dịch native.
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --omit=optional
COPY . .

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache sqlite
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
EXPOSE 4000
CMD ["node", "src/server.js"]
