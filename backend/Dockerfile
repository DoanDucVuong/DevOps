# Backend Service — Node.js / Express
FROM node:20-alpine

WORKDIR /app

# Cài đặt công cụ biên dịch C++ native cho better-sqlite3 trên Alpine Linux
RUN apk add --no-cache python3 make g++ sqlite

# Cài đặt dependencies (bao gồm better-sqlite3)
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn Backend
COPY . .

# Phơi port 4000
EXPOSE 4000

# Lệnh khởi chạy chính thức
CMD ["npm", "start"]
