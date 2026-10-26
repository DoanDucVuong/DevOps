# 🚀 HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG LÊN MÁY ẢO AWS EC2 (UBUNTU)

Tài liệu này cung cấp kịch bản từng bước (Step-by-Step) chuẩn kỹ thuật DevOps để đóng gói và triển khai toàn bộ hệ thống Microservices (**Frontend React**, **Backend Express**, **ML Service FastAPI**) lên máy ảo AWS EC2 chạy hệ điều hành Ubuntu.

---

## 📋 Mục lục
1. [Kiến trúc triển khai](#1-kiến-trúc-triển-khai)
2. [Cấu hình AWS EC2 & Security Group](#2-cấu-hình-aws-ec2--security-group)
3. [Bước 1: Kết nối SSH vào máy ảo EC2](#bước-1-kết-nối-ssh-vào-máy-ảo-ec2)
4. [Bước 2: Cài đặt Docker & Docker Compose](#bước-2-cài-đặt-docker--docker-compose)
5. [Bước 3: Tải mã nguồn từ GitHub](#bước-3-tải-mã-nguồn-từ-github)
6. [Bước 4: Cấu hình biến môi trường](#bước-4-cấu-hình-biến-môi-trường)
7. [Bước 5: Khởi chạy hệ thống bằng Docker Compose](#bước-5-khởi-chạy-hệ-thống-bằng-docker-compose)
8. [Bước 6: Kiểm tra sức khỏe hệ thống (Smoke Test)](#bước-6-kiểm-tra-sức-khỏe-hệ-thống-smoke-test)
9. [Bảo trì, Quản lý Logs & Dữ liệu SQLite](#9-bảo-trì-quản-lý-logs--dữ-liệu-sqlite)

---

## 1. Kiến trúc triển khai

Toàn bộ hệ thống chạy trên **Docker Compose** với mạng nội bộ riêng (`app-network`):
- **sttn-frontend**: Nginx phục vụ Single Page App (React/Vite) tại cổng **`80`**.
- **sttn-backend**: Node.js 20 Express REST API tại cổng **`4000`**.
- **sttn-ml-service**: Python 3.9 FastAPI AI Recommendation Engine tại cổng **`8001`**.
- **SQLite Persistence**: Tệp CSDL `sttn.db` được ánh xạ Volume trực tiếp vào `./backend/src/db` trên ổ đĩa máy chủ EC2, bảo đảm **dữ liệu 100% không bị mất** khi container khởi động lại hoặc cập nhật code.

---

## 2. Cấu hình AWS EC2 & Security Group

### 2.1. Cấu hình phần cứng khuyến nghị
- **AMI**: Ubuntu Server 22.04 LTS hoặc 24.04 LTS (64-bit x86).
- **Instance Type**: `t3.medium` (2 vCPU, 4GB RAM) hoặc tối thiểu `t3.small` (2GB RAM).
  > **Mẹo (Tip):** Nếu dùng gói Free Tier `t2.micro` (1GB RAM), bắt buộc phải tạo 2GB Swap Memory (xem mục 9) để trình biên dịch không bị tràn RAM khi cài đặt thư viện học máy (`scikit-surprise`, `scipy`).

### 2.2. Mở cổng mạng (Inbound Security Group Rules)
Trong trang quản lý AWS EC2 -> **Security Groups** -> Chọn Security Group của instance -> **Edit Inbound Rules**, mở các port sau:

| Type | Protocol | Port Range | Source | Mô tả |
| :--- | :---: | :---: | :---: | :--- |
| **SSH** | TCP | `22` | `My IP` hoặc `0.0.0.0/0` | Kết nối dòng lệnh SSH |
| **HTTP** | TCP | `80` | `0.0.0.0/0` | Giao diện Web Khách hàng & Admin |
| **Custom TCP** | TCP | `4000` | `0.0.0.0/0` | Backend API Endpoint |
| **Custom TCP** | TCP | `8001` | `0.0.0.0/0` | ML Recommendation API |

---

## Bước 1: Kết nối SSH vào máy ảo EC2

Mở terminal trên máy tính của bạn (PowerShell, Git Bash hoặc Linux Terminal):

```bash
# Phân quyền tệp key AWS (bắt buộc trên Linux/macOS)
chmod 400 "your-key-pair.pem"

# SSH vào EC2 (thay your-key-pair.pem và IP Public thật của bạn)
ssh -i "your-key-pair.pem" ubuntu@<EC2_PUBLIC_IP>
```

---

## Bước 2: Cài đặt Docker & Docker Compose

Chạy khối lệnh sau để cập nhật hệ thống và cài đặt Docker Engine chính thức:

```bash
# 1. Cập nhật hệ thống
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

# 2. Thêm GPG key chính thức của Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3. Thiết lập Docker Repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Cài đặt Docker và Docker Compose Plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Cấp quyền chạy Docker không cần sudo
sudo usermod -aG docker $USER
newgrp docker

# 6. Kiểm tra phiên bản đã cài đặt
docker --version
docker compose version
```

---

## Bước 3: Tải mã nguồn từ GitHub

Kéo repository dự án về thư mục làm việc của EC2:

```bash
# Clone dự án
git clone https://github.com/DoanDucVuong/DevOps.git

# Di chuyển vào thư mục dự án
cd DevOps/sttn-recommend
```

---

## Bước 4: Cấu hình biến môi trường

Frontend React được build tĩnh nên trình duyệt của người dùng sẽ gọi API thông qua địa chỉ IP Public của máy ảo EC2.

Thiết lập IP Public của bạn vào biến môi trường trước khi build:

```bash
# Lấy tự động Public IP của máy ảo EC2 hiện tại:
EC2_IP=$(curl -s http://checkip.amazonaws.com)
echo "Public IP của EC2 là: $EC2_IP"

# Xuất biến API URL trỏ vào Backend của EC2
export VITE_API_URL="http://${EC2_IP}:4000/api"
```

*(Hoặc tạo tệp `.env` tại thư mục gốc nếu muốn cấu hình cố định):*
```bash
cat <<EOF > .env
VITE_API_URL=http://${EC2_IP}:4000/api
JWT_SECRET=super_secret_jwt_key_ec2_production_2026
INTERNAL_API_KEY=dev-internal-key
EOF
```

---

## Bước 5: Khởi chạy hệ thống bằng Docker Compose

Chạy lệnh build và khởi động toàn bộ 3 microservices trong chế độ chạy ngầm (detached mode):

```bash
docker compose up -d --build
```

Quá trình build diễn ra tự động:
1. `ml-service`: Biên dịch môi trường Python, huấn luyện sẵn mô hình SVD/TF-IDF.
2. `backend`: Biên dịch native module SQLite trên Alpine, kết nối `sttn.db`.
3. `frontend`: Đóng gói Vite sang static HTML/JS/CSS và cấu hình Nginx.

---

## Bước 6: Kiểm tra sức khỏe hệ thống (Smoke Test)

Sau khi Docker Compose hoàn tất, kiểm tra trạng thái các container:

```bash
# 1. Xem danh sách container đang chạy
docker compose ps

# 2. Kiểm tra phản hồi HTTP nội bộ
curl -I http://localhost:80
curl -I http://localhost:4000/health
curl -I http://localhost:8001/health
```

### 👉 Trải nghiệm trực tiếp trên trình duyệt Web:
- **Trang bán hàng (Storefront):** `http://<EC2_PUBLIC_IP>`
- **Trang Quản trị (Admin):** `http://<EC2_PUBLIC_IP>/admin` (Tài khoản: `admin@sttn.vn` / Mật khẩu: `admin123`)
- **Backend API Docs/Health:** `http://<EC2_PUBLIC_IP>:4000/health`
- **ML Service Health:** `http://<EC2_PUBLIC_IP>:8001/health`

---

## 9. Bảo trì, Quản lý Logs & Dữ liệu SQLite

### 9.1. Quản lý dữ liệu SQLite bền vững
CSDL SQLite `sttn.db` được lưu trữ tại `backend/src/db/sttn.db` trên ổ cứng EC2. Mọi đơn hàng, lịch sử review, và voucher mới sẽ **luôn tồn tại an toàn** kể cả khi chạy `docker compose down`.

Để sao lưu (Backup) CSDL:
```bash
cp backend/src/db/sttn.db ~/backup_sttn_$(date +%Y%m%d).db
```

### 9.2. Xem nhật ký (Logs) thời gian thực
```bash
# Xem toàn bộ log
docker compose logs -f

# Xem riêng từng service
docker compose logs -f backend
docker compose logs -f ml-service
docker compose logs -f frontend
```

### 9.3. Cập nhật mã nguồn mới nhất (CI/CD Thủ công)
Khi có commit mới trên nhánh `main`:
```bash
git pull origin main
docker compose up -d --build
```

### 9.4. Xử lý thiếu RAM trên máy ảo nhỏ (Swap Memory)
Nếu build bị báo lỗi `Killed` hoặc `out of memory` trên instance nhỏ:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
