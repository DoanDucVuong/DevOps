"""
ML Serving Service (Python/FastAPI) — mục 3.2.2 & 3.2.5 báo cáo.

Nạp các artifact đã huấn luyện (TF-IDF, SVD, Popularity) và phục vụ suy luận
(inference) theo thời gian thực. Backend (Node/Express) sẽ gọi các endpoint
này thay vì tự tính toán gợi ý.

Chạy: uvicorn app:app --reload --port 8001
"""
import json
import os
import sys
import threading
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Cấu hình UTF-8 an toàn cho stdout/stderr trên Windows
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass



import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import train

load_dotenv()
MODEL_DIR = Path(__file__).parent / "models"
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "")

# ---------- Trạng thái mô hình (được thay mới sau mỗi lần retrain) ----------
products_df = None
product_ids: list = []
id_to_pos: dict = {}
content_similarity = None
svd_model = None
popularity_list: list = []
collaborative_metrics: dict = {}
training_summary: dict = {}

training_state = {"running": False, "started_at": None, "finished_at": None, "error": None}
_state_lock = threading.Lock()


def load_artifacts():
    """Nạp (hoặc nạp lại) toàn bộ artifact từ thư mục models/ vào bộ nhớ."""
    global products_df, product_ids, id_to_pos, content_similarity, svd_model
    global popularity_list, collaborative_metrics, training_summary

    new_products = pd.read_json(MODEL_DIR / "products_index.json", dtype={"id": str})
    new_products = new_products.set_index("id", drop=False)
    new_ids = list(new_products.index)
    new_map = {pid: i for i, pid in enumerate(new_ids)}
    new_sim = np.load(MODEL_DIR / "content_similarity.npy")
    new_svd = joblib.load(MODEL_DIR / "svd_model.joblib")
    with open(MODEL_DIR / "popularity.json", encoding="utf-8") as f:
        new_pop = json.load(f)
    with open(MODEL_DIR / "collaborative_metrics.json") as f:
        new_metrics = json.load(f)
    summary_path = MODEL_DIR / "training_summary.json"
    new_summary = json.load(open(summary_path)) if summary_path.exists() else {}

    with _state_lock:  # gán một lượt để tránh trạng thái nửa cũ nửa mới
        products_df, product_ids, id_to_pos = new_products, new_ids, new_map
        content_similarity, svd_model, popularity_list = new_sim, new_svd, new_pop
        collaborative_metrics, training_summary = new_metrics, new_summary


def _train_job(source: str = "auto"):
    try:
        train.run_training(source)
        load_artifacts()
        training_state["error"] = None
    except Exception as exc:  # noqa: BLE001
        training_state["error"] = str(exc)[:500]
        print("[retrain] lỗi:", exc)
    finally:
        training_state["running"] = False
        training_state["finished_at"] = datetime.now(timezone.utc).isoformat()


def start_training(source: str = "auto") -> bool:
    with _state_lock:
        if training_state["running"]:
            return False
        training_state.update(running=True, started_at=datetime.now(timezone.utc).isoformat(), error=None)
    threading.Thread(target=_train_job, args=(source,), daemon=True).start()
    return True


load_artifacts()


def _startup_retrain():
    """Đợi Backend sẵn sàng (có thể đang thức dậy trên Render free) rồi học lại từ dữ liệu thật."""
    import time
    for _ in range(6):
        if train.fetch_real_data() is not None:
            break
        time.sleep(15)
    start_training("auto")


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Mỗi lần service khởi động, tự học lại từ dữ liệu thật đang lưu trong database
    if os.getenv("BACKEND_URL") and INTERNAL_API_KEY and os.getenv("AUTO_RETRAIN_ON_START", "true").lower() != "false":
        threading.Thread(target=_startup_retrain, daemon=True).start()
    yield


app = FastAPI(
    title="STTN Recommendation ML Service",
    description="Content-based / Collaborative / Hybrid / Popularity-based product recommendations",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/ping")
def ping():
    return {"status": "ok", "service": "sttn-ml-service"}



# ---------- Schemas ----------
class RecommendationItem(BaseModel):
    product_id: str
    score: float
    algorithm: str


class RecommendationResponse(BaseModel):
    user_id: Optional[str]
    algorithm_used: str
    items: list[RecommendationItem]


# ---------- Helper functions ----------
def popularity_fallback(top_k: int, exclude: set[str] | None = None) -> list[RecommendationItem]:
    exclude = exclude or set()
    items = []
    for row in popularity_list:
        if row["id"] in exclude:
            continue
        items.append(RecommendationItem(
            product_id=row["id"],
            score=round(float(row["popularity_score"]), 3),
            algorithm="popularity",
        ))
        if len(items) >= top_k:
            break
    return items


def content_based_similar(product_id: str, top_k: int) -> list[RecommendationItem]:
    if product_id not in id_to_pos:
        raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại trong index của ML service")
    idx = id_to_pos[product_id]
    scores = content_similarity[idx]
    ranked = sorted(
        ((pid, scores[i]) for pid, i in id_to_pos.items() if pid != product_id),
        key=lambda x: x[1],
        reverse=True,
    )[:top_k]
    return [
        RecommendationItem(product_id=pid, score=round(float(s), 3), algorithm="content_based")
        for pid, s in ranked
    ]


def collaborative_predict_all(user_id: str) -> list[tuple[str, float]]:
    """Dự đoán điểm SVD cho toàn bộ sản phẩm đối với 1 user."""
    preds = []
    for pid in product_ids:
        pred = svd_model.predict(user_id, pid)
        preds.append((pid, pred.est))
    return preds


def hybrid_recommend(user_id: str, top_k: int, alpha: float = 0.5) -> list[RecommendationItem]:
    """
    Weighted Hybrid (mục 2.3 & 3.2.4 báo cáo):
    score_final = alpha * collaborative_score_norm + (1-alpha) * content_score_norm

    content_score cho từng sản phẩm ứng viên = độ tương đồng trung bình với các sản phẩm
    mà user đã có rating cao nhất (đại diện cho "khẩu vị" nội dung của user).
    Hàm này giả định user_id đã được xác nhận có trong trainset (caller kiểm tra qua _knows_user).
    """
    collab_preds = collaborative_predict_all(user_id)
    collab_scores = {pid: score for pid, score in collab_preds}
    collab_vals = np.array(list(collab_scores.values()))
    collab_norm = _minmax(collab_vals)
    collab_norm_map = {pid: v for pid, v in zip(collab_scores.keys(), collab_norm)}

    # Nội dung ưa thích: trung bình cosine similarity với top-3 sản phẩm collaborative dự đoán cao nhất
    seed_products = [pid for pid, _ in sorted(collab_scores.items(), key=lambda x: x[1], reverse=True)[:3]]
    seed_idxs = [id_to_pos[pid] for pid in seed_products]
    content_scores = content_similarity[seed_idxs].mean(axis=0)
    content_norm = _minmax(content_scores)
    content_norm_map = {pid: content_norm[id_to_pos[pid]] for pid in product_ids}

    final = []
    for pid in product_ids:
        s = alpha * collab_norm_map[pid] + (1 - alpha) * content_norm_map[pid]
        final.append((pid, s))
    final.sort(key=lambda x: x[1], reverse=True)

    return [
        RecommendationItem(product_id=pid, score=round(float(s), 3), algorithm="hybrid")
        for pid, s in final[:top_k]
    ]


def _knows_user(user_id: str) -> bool:
    try:
        svd_model.trainset.to_inner_uid(user_id)
        return True
    except ValueError:
        return False


def _minmax(arr: np.ndarray) -> np.ndarray:
    if arr.max() == arr.min():
        return np.zeros_like(arr)
    return (arr - arr.min()) / (arr.max() - arr.min())


# ---------- Endpoints (khớp mục 3.2.5 Thiết kế API) ----------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "n_products": len(product_ids),
        "collaborative_metrics": collaborative_metrics,
        "training_summary": training_summary,
        "training": dict(training_state),
    }


@app.get("/recommendations/{user_id}", response_model=RecommendationResponse)
def get_recommendations(user_id: str, top_k: int = 8):
    """
    GET /api/recommendations/:userId (Backend proxy tới đây)
    Trả về danh sách "Gợi ý dành cho bạn" (Recommended for You) — mục 3.2.6a.
    Dùng Hybrid nếu user đã có dữ liệu tương tác, ngược lại fallback Popularity (Cold-start).
    """
    if _knows_user(user_id):
        items = hybrid_recommend(user_id, top_k)
        algo = "hybrid"
    else:
        items = popularity_fallback(top_k)
        algo = "popularity"

    return RecommendationResponse(user_id=user_id, algorithm_used=algo, items=items)


@app.get("/products/{product_id}/similar", response_model=RecommendationResponse)
def get_similar_products(product_id: str, top_k: int = 4):
    """
    GET /api/products/:id/similar
    "Sản phẩm tương tự / You May Also Like" — Content-based Filtering — mục 3.2.6c.
    """
    items = content_based_similar(product_id, top_k)
    return RecommendationResponse(user_id=None, algorithm_used="content_based", items=items)


@app.get("/popular", response_model=RecommendationResponse)
def get_popular(top_k: int = 8):
    """Dùng cho Guest chưa đăng nhập / chưa có tương tác (Cold-start) — mục 3.2.1."""
    items = popularity_fallback(top_k)
    return RecommendationResponse(user_id=None, algorithm_used="popularity", items=items)


@app.post("/retrain", status_code=202)
def retrain(x_internal_key: Optional[str] = Header(default=None)):
    """
    Huấn luyện lại từ dữ liệu thật (Backend) — chạy NỀN, trả về ngay.
    Theo dõi tiến trình qua GET /health (trường "training"). Có khoá nội bộ thì bắt buộc gửi header.
    """
    if INTERNAL_API_KEY and x_internal_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    if not start_training("auto"):
        raise HTTPException(status_code=409, detail="Đang huấn luyện, vui lòng đợi hoàn tất.")
    return {"status": "started"}
