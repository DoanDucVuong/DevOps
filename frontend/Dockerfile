# Stage 1: Build Frontend (Vite / React)
FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Khai báo build argument cho API URL (mặc định '/api' để Nginx reverse-proxy sang backend)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build static assets ra thư mục dist
RUN npm run build

# Stage 2: Serve tĩnh bằng Nginx
FROM nginx:alpine AS runner

# Copy static assets từ builder sang thư mục web của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy cấu hình Nginx (hỗ trợ React Router SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Phơi port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
