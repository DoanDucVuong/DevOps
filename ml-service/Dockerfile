# ML Serving Service — Python/FastAPI (mục 3.2.2 báo cáo)
FROM python:3.11-slim AS base

# scikit-surprise cần biên dịch (Cython) -> cần build-essential
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Huấn luyện mô hình ngay lúc build image để container khởi động là có sẵn model
# (Production nên tách bước này ra một job huấn luyện riêng + Model Registry MLflow,
#  xem ghi chú trong README ở thư mục gốc).
RUN cd data && python products.py && python generate_interactions.py && cd .. && python train.py

EXPOSE 8001
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
