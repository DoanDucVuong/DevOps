# Stage 1: Build mã nguồn React/Vite bằng Node 20
FROM node:20-alpine AS builder
WORKDIR /app

# Copy khai báo thư viện và cài đặt
COPY tmdtwed/package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn vào và build
COPY tmdtwed/ ./
RUN npm run build

# Stage 2: Serve bằng Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
