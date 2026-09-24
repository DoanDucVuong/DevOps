# Stage 1: Build mã nguồn React/Vite
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json từ thư mục con tmdtwed vào container
COPY tmdtwed/package*.json ./
RUN npm install

# Copy toàn bộ code từ thư mục tmdtwed vào container để build
COPY tmdtwed/ ./
RUN npm run build

# Stage 2: Serve bằng Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
