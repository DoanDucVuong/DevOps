# ML Recommendation Service — Python FastAPI
FROM python:3.11-slim

WORKDIR /app

# Cài đặt Python dependencies (Python 3.11 hỗ trợ 100% prebuilt wheels cho scikit-surprise, numpy, pandas)
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn ML Service
COPY . .

# Phơi port 8001
EXPOSE 8001

# Lệnh khởi chạy uvicorn theo yêu cầu kỹ thuật
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
