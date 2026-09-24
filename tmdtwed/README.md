# Maison — Dự án Thương mại điện tử (Frontend)

Dự án đã hoàn thành **Bước 1 → Bước 13** trong lộ trình: khởi tạo project, cài đặt Tailwind/React Router/Zustand/Lucide, cấu trúc thư mục, mock data, Header/Footer/Layout, Home, Products (search/filter/sort), Product Detail, Cart + Zustand + LocalStorage, Wishlist, Login/Register giả lập, Checkout, Orders/Profile.

## Cách chạy dự án

```bash
npm install
npm run dev
```

Mở trình duyệt tại địa chỉ hiển thị trong terminal (mặc định `http://localhost:5173`).

Build bản production:

```bash
npm run build
npm run preview
```

## Công nghệ đã dùng

- React 19 + Vite
- Tailwind CSS v4 (qua `@tailwindcss/vite`, cấu hình token màu/font trong `src/index.css`)
- React Router v7 (`react-router-dom`)
- Zustand (cart, wishlist, auth) với middleware `persist` lưu vào LocalStorage
- Lucide React cho icon

## Những gì còn lại theo lộ trình gốc (Bước 14–15)

- **Responsive**: đã responsive cơ bản (mobile menu, mobile filter drawer, grid co giãn), nên tự kiểm tra thêm ở các breakpoint đặc biệt của thiết bị thật.
- **Kiểm tra & hoàn thiện**: nên bổ sung thêm ảnh sản phẩm thật, kiểm thử toàn bộ luồng (Home → Products → Detail → Cart → Checkout → Orders), và tinh chỉnh nội dung/copy.

## Ghi chú

- Toàn bộ dữ liệu (giỏ hàng, wishlist, tài khoản) lưu ở LocalStorage của trình duyệt — không có Backend/API thật.
- Đăng ký sẽ lưu tài khoản mới vào LocalStorage; đăng nhập chỉ so khớp với các tài khoản đã đăng ký trên chính trình duyệt đó.
- Ảnh sản phẩm hiện lấy từ Unsplash (qua URL trực tiếp) chỉ để minh hoạ giao diện.
