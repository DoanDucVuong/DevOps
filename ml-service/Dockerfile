# ML Recommendation Service — Python FastAPI
FROM python:3.9-slim

# Cài đặt build-essential để biên dịch các thư viện học máy C/Cython (scikit-surprise)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cài đặt Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn ML Service
COPY . .

# Phơi port 8001
EXPOSE 8001

# Lệnh khởi chạy uvicorn theo yêu cầu kỹ thuật
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
