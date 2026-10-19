# STTN Recommendation System

Hệ thống gợi ý sản phẩm thương mại điện tử ứng dụng Machine Learning, theo kiến trúc Chương 3 báo cáo thực tập.

```
sttn-recommend/
├── ml-service/   # Python/FastAPI — Content-based (TF-IDF), Collaborative (SVD), Hybrid, Popularity
├── backend/      # Node.js/Express — Auth JWT, Products, Orders, Interactions, Admin, proxy ML
├── frontend/     # React/Vite — giao diện + trang Admin
├── docker-compose.yml          # postgres + ml-service + backend + frontend
└── .github/workflows/deploy.yml
```

## 1. Những gì hệ thống làm được

- **Mua hàng thật qua Backend**: Checkout tạo đơn trong database; server **tự tính lại giá và tổng tiền** từ bảng `products` (không tin giá do trình duyệt gửi). Trang Orders đọc đơn từ Backend.
- **Trang Admin** (`/admin`, chỉ tài khoản role `admin`): doanh thu 7 ngày, CTR theo thuật toán, top sản phẩm, đổi trạng thái đơn hàng, xem chỉ số mô hình (RMSE/MAE) và bấm **Huấn luyện lại**.
- **ML học từ dữ liệu thật**: mọi lượt xem / thêm giỏ / mua / đánh giá được ghi vào bảng `interactions`. ML service đọc chúng qua `GET /api/internal/export` (xác thực bằng `INTERNAL_API_KEY`), trộn với dữ liệu giả lập làm nền (giải quyết cold-start), huấn luyện lại và **nạp mô hình mới ngay, không cần khởi động lại**. ML cũng tự học lại mỗi lần khởi động.
- **Database kép**: có `DATABASE_URL` → PostgreSQL; để trống → SQLite (chạy local không cần cài gì). Cùng một bộ SQL cho cả hai.
- **Frontend chạy 2 chế độ**: có `VITE_API_URL` → dùng Backend thật; không có → mock/LocalStorage hoàn toàn (đơn hàng lưu trong trình duyệt), không gửi request mạng nào.

## 2. Khác biệt so với thiết kế gốc trong báo cáo

| Báo cáo | Bản này | Ghi chú |
|---|---|---|
| MongoDB (nghiệp vụ) | PostgreSQL (hoặc SQLite khi dev) | Bảng/cột giữ đúng thiết kế |
| PostgreSQL Feature Store tách riêng | Dùng chung 1 PostgreSQL | Đủ cho quy mô demo |
| Redis Cache | Chưa có | |
| MLflow Model Registry | Artifact trong `ml-service/models/` + `training_summary.json` | Có ghi thời điểm, nguồn dữ liệu, RMSE/MAE mỗi lần huấn luyện |

## 3. Chạy local (PowerShell)

Mở 3 terminal, chạy **theo thứ tự**. Thay `<GOC>` bằng thư mục chứa `ml-service`, `backend`, `frontend`.

**Terminal 1 — ML service**
```powershell
cd <GOC>\ml-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd data
python products.py
python generate_interactions.py
cd ..
copy .env.example .env
python train.py
uvicorn app:app --reload --port 8001
```
**Terminal 2 — Backend**
```powershell
cd <GOC>\backend
copy .env.example .env
npm install
npm run dev
```
Mặc định dùng SQLite. Muốn dùng PostgreSQL local, điền `DATABASE_URL=postgresql://user:pass@localhost:5432/sttn` trong `.env`.

**Terminal 3 — Frontend**
```powershell
cd <GOC>\frontend
copy .env.example .env
npm install
npm run dev
```
`frontend\.env` cần có `VITE_API_URL=http://localhost:4000/api` (đã có sẵn trong `.env.example`). Xoá dòng này để chạy frontend độc lập.

Tài khoản admin: `admin@sttn.vn` / `admin123` (đổi bằng `ADMIN_PASSWORD` **trước lần chạy đầu tiên**).

## 4. Chạy bằng Docker Compose

```powershell
docker compose up -d --build
```
Frontend http://localhost:8080 · Backend http://localhost:4000 · ML http://localhost:8001. Dữ liệu nằm trong volume `pg-data` (đơn hàng, tài khoản, tương tác) và `ml-models` (mô hình đã học). `docker compose down -v` sẽ xoá sạch cả hai.

## 5. Deploy lên Render

Thứ tự: **PostgreSQL → ml-service → backend → frontend.**

1. **PostgreSQL**: Render → New → PostgreSQL → tạo. Lấy **Internal Database URL**.
   *Lưu ý: gói Free của Render Postgres có giới hạn thời hạn — kiểm tra điều kiện hiện hành trước khi dùng cho dữ liệu cần giữ lâu. Có thể thay bằng Neon/Supabase (miễn phí), khi đó dùng URL của họ và đặt `DATABASE_SSL=true`.*
2. **ml-service** (Web Service, Docker, Root Directory `ml-service`): đặt `BACKEND_URL` (điền sau khi có URL backend) và `INTERNAL_API_KEY` = chuỗi bí mật dài (dùng chung với backend).
3. **backend** (Web Service, Docker, Root Directory `backend`):

| Biến | Giá trị |
|---|---|
| `DATABASE_URL` | URL PostgreSQL ở bước 1 |
| `JWT_SECRET` | chuỗi ngẫu nhiên dài |
| `INTERNAL_API_KEY` | **giống hệt** ml-service |
| `ML_SERVICE_URL` | URL ml-service |
| `ADMIN_PASSWORD` | mật khẩu admin riêng của bạn — **đặt trước lần deploy đầu**, vì mặc định `admin123` là công khai |
| `CORS_ORIGIN` | (tuỳ chọn) URL frontend |

   Sau khi có URL backend, quay lại ml-service điền `BACKEND_URL`.
4. **frontend** (Static Site, Root Directory `frontend`, Build `npm install && npm run build`, Publish `dist`): đặt `VITE_API_URL=https://<backend>.onrender.com/api`, thêm Rewrite `/*` → `/index.html`. Đổi `VITE_API_URL` thì phải build lại (Manual Deploy → Clear build cache).

Giới hạn gói Free: service ngủ khi không có truy cập (lần đầu mở chậm 30–60 giây); đĩa không bền, nên mô hình ML được học lại từ PostgreSQL mỗi lần ml-service thức dậy.

## 6. Quy trình huấn luyện lại

- **Tự động**: mỗi lần ml-service khởi động.
- **Thủ công**: trang Admin → "Huấn luyện lại", hoặc `POST /api/admin/ml/retrain` (kèm token admin). Chạy nền; theo dõi ở `GET /api/admin/ml/status`.

Để thấy hiệu quả, cần nhiều người dùng thật có tương tác. Dữ liệu thật ít thì dữ liệu giả lập vẫn chiếm phần lớn nên gợi ý chưa thay đổi rõ; khi đã đủ dữ liệu thật, đặt `USE_SYNTHETIC_BASE=false` cho ml-service.

## 7. Số liệu để đưa vào báo cáo

Sau mỗi lần huấn luyện, xem `ml-service/models/training_summary.json` (hoặc trang Admin): RMSE/MAE 5-fold, số tương tác thật, số người dùng, thời điểm huấn luyện. Chỉ số CTR theo thuật toán lấy ở trang Admin (cần có lượt hiển thị và click thật).

## 8. Tích hợp Jenkins CI/CD Pipeline

Dự án đã tích hợp sẵn tệp [`Jenkinsfile`](./Jenkinsfile) Declarative Pipeline tự động hoá:
- **Kiểm tra cú pháp & chất lượng code** (Node.js, React, Python).
- **Đóng gói Docker Images** cho cả 3 microservices (Backend, Frontend, ML Service).
- **Đẩy ảnh lên Docker Hub** (tuỳ chọn).
- **Triển khai tự động (Continuous Deployment)** bằng Docker Compose và kiểm tra sức khoẻ (Smoke Test).

Chi tiết cài đặt máy chủ Jenkins và kích hoạt Pipeline xem tại: [jenkins/README_JENKINS.md](./jenkins/README_JENKINS.md).

## 9. Giới hạn đã biết

- Giỏ hàng và wishlist vẫn lưu trong trình duyệt (chưa đồng bộ lên Backend).
- Tìm kiếm không phân biệt dấu/hoa-thường cho tiếng Việt chỉ đúng với ký tự ASCII (hạn chế của `LOWER` trong SQLite); trang Products hiện lọc ở phía frontend nên không bị ảnh hưởng.
- Chưa có quên mật khẩu, xác minh email, thanh toán thật.
