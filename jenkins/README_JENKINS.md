# HƯỚNG DẪN TÍCH HỢP & VẬN HÀNH JENKINS CI/CD PIPELINE

Hệ thống CI/CD Pipeline này được xây dựng theo chuẩn DevOps công nghiệp bằng **Jenkins Declarative Pipeline**, tự động hóa toàn bộ quy trình từ kiểm tra mã nguồn, đóng gói Docker cho đến triển khai hệ thống (Continuous Integration & Continuous Deployment).

---

## 1. Kiến trúc Pipeline trong dự án

Quy trình Pipeline bao gồm **6 giai đoạn (Stages)** được định nghĩa trong file [`Jenkinsfile`](../Jenkinsfile):

```
+----------------------------------------------------------------------------------------------------+
|                                    JENKINS CI/CD PIPELINE                                          |
+-------------------+--------------------+-------------------+-------------------+-------------------+
| 1. Checkout Code  | 2. Lint & Syntax   | 3. Docker Build   | 4. Docker Push    | 5. CD & Deploy    |
| (Pull từ GitHub)  | (Node/Python/Vite) | (3 Microservices) | (Lên Docker Hub)  | (Docker Compose)  |
+-------------------+--------------------+-------------------+-------------------+-------------------+
                                                                                           |
                                                                                           v
                                                                             +---------------------------+
                                                                             | 6. Smoke & Health Check   |
                                                                             | (Kiểm tra HTTP 200 OK)    |
                                                                             +---------------------------+
```

### Chi tiết các Stage:
1. **Stage 1 - Checkout Code**: Kéo phiên bản mã nguồn mới nhất từ nhánh `main` của GitHub ([DoanDucVuong/DevOps](https://github.com/DoanDucVuong/DevOps)).
2. **Stage 2 - Code Quality & Syntax Check**: Chạy song song (Parallel) kiểm tra cú pháp và tính toàn vẹn của mã nguồn cho cả 3 service (Backend Node.js, Frontend React/Vite, ML Python).
3. **Stage 3 - Build Docker Images**: Tự động đóng gói 3 container images tương ứng:
   - `sttn-ml-service`: Python 3.11, FastAPI, các thuật toán học máy TF-IDF và SVD.
   - `sttn-backend`: Node.js 20 Express, kết nối PostgreSQL.
   - `sttn-frontend`: Nginx phục vụ ứng dụng React tĩnh.
4. **Stage 4 - Push to Docker Hub (Tuỳ chọn)**: Đăng nhập và đẩy image có gắn tag `BUILD_NUMBER` và `latest` lên Docker Hub registry.
5. **Stage 5 - Continuous Deployment (CD)**: Tự động cập nhật và khởi chạy các container trên môi trường bằng `docker compose up -d`.
6. **Stage 6 - Smoke Test & Health Check**: Tự động gửi HTTP request kiểm tra `/health` của Backend và ML Service để đảm bảo dịch vụ đã sẵn sàng phục vụ trước khi kết thúc Pipeline.

---

## 2. Cách khởi động Jenkins Server bằng Docker (Chỉ 1 lệnh)

Trong thư mục `jenkins`, mở Terminal (PowerShell hoặc Bash) và chạy lệnh:

```bash
docker compose -f jenkins/docker-compose.jenkins.yml up -d --build
```

Container Jenkins sẽ được khởi động tại cổng **`8085`**.

### Lấy mật khẩu khởi tạo (Initial Admin Password):
Chạy lệnh sau trên terminal:
```bash
docker exec -it sttn-jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
```
Copy chuỗi ký tự hiển thị ra để dán vào trang cài đặt lần đầu của Jenkins.

---

## 3. Các bước thiết lập Pipeline trên giao diện Jenkins

1. **Truy cập Jenkins**: Mở trình duyệt vào `http://localhost:8085`.
2. **Đăng nhập lần đầu**: Dán mật khẩu đã lấy ở bước trên -> Chọn **Install suggested plugins** -> Tạo tài khoản Admin cá nhân của bạn.
3. **Cài đặt Plugin hỗ trợ Docker & Pipeline**:
   - Vào **Manage Jenkins** -> **Plugins** -> Thẻ **Available plugins**.
   - Tìm và cài đặt:
     - `Pipeline`
     - `Docker Pipeline`
     - `Git`
     - `Credentials Binding`
   - Bấm **Install without restart**.
4. **Tạo Job Pipeline mới**:
   - Ở trang chủ Jenkins, bấm **New Item**.
   - Nhập tên: `DevOps_BanHang_Pipeline`.
   - Chọn loại: **Pipeline** -> Bấm **OK**.
5. **Cấu hình Job**:
   - Cuộn xuống phần **Pipeline**:
     - **Definition**: Chọn `Pipeline script from SCM`.
     - **SCM**: Chọn `Git`.
     - **Repository URL**: `https://github.com/DoanDucVuong/DevOps.git`.
     - **Branch Specifier**: `*/main`.
     - **Script Path**: `Jenkinsfile`.
   - Bấm **Save**.

---

## 4. Chạy Pipeline và Kiểm tra kết quả

1. Nhấn nút **Build with Parameters** ở menu bên trái.
2. Bạn có thể bật/tắt các tham số:
   - `RUN_LINT`: Kiểm tra cú pháp (Mặc định: `true`).
   - `BUILD_DOCKER`: Đóng gói Docker images (Mặc định: `true`).
   - `PUSH_DOCKER`: Đẩy lên Docker Hub (Nếu có tài khoản Docker Hub thì tích chọn).
   - `DEPLOY_LOCAL`: Tự động khởi chạy hệ thống (Mặc định: `true`).
3. Nhấn **Build**.
4. Quan sát tiến trình qua giao diện **Stage View** trực quan. Toàn bộ các bước từ Checkout, Build đến Deploy sẽ sáng màu xanh lục (Success)!

---

## 5. Truy cập hệ thống sau khi Pipeline hoàn tất:
- **Giao diện Khách hàng (Frontend)**: `http://localhost:8080`
- **Máy chủ Backend API**: `http://localhost:4000/health`
- **Máy chủ Trí tuệ nhân tạo (ML Service)**: `http://localhost:8001/health`
