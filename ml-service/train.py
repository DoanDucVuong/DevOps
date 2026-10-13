"""
Machine Learning Pipeline cho hệ thống gợi ý sản phẩm (mục 3.2.4 báo cáo).

NGUỒN DỮ LIỆU
  - Dữ liệu THẬT: lấy từ Backend qua GET {BACKEND_URL}/api/internal/export
    (cần BACKEND_URL + INTERNAL_API_KEY). Đây là bảng Interactions do người dùng tạo ra khi
    xem / thêm giỏ / mua / đánh giá sản phẩm trên website.
  - Dữ liệu GIẢ LẬP (data/interactions.csv): dùng làm "nền" để giải quyết Cold-start khi dữ liệu
    thật còn ít. Tắt bằng USE_SYNTHETIC_BASE=false khi đã có đủ dữ liệu thật.

Chạy tay:  python train.py            (tự động: có Backend thì dùng dữ liệu thật)
           python train.py synthetic  (chỉ dùng dữ liệu giả lập)
"""
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from surprise import Dataset, Reader, SVD, accuracy
from surprise.model_selection import cross_validate, train_test_split

load_dotenv()

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

INTERACTION_COLUMNS = ["user_id", "product_id", "interaction_type", "rating_value"]


def fetch_real_data():
    """Lấy sản phẩm + tương tác thật từ Backend. Trả về None nếu chưa cấu hình / không kết nối được."""
    base = os.getenv("BACKEND_URL", "").strip()
    key = os.getenv("INTERNAL_API_KEY", "")
    if not base or not key:
        print("[Data] Chưa cấu hình BACKEND_URL / INTERNAL_API_KEY -> bỏ qua dữ liệu thật")
        return None
    if not base.startswith("http://") and not base.startswith("https://"):
        base = "https://" + base
    if "sttn-backend" in base and ".onrender.com" not in base:
        base = base.replace("sttn-backend", "sttn-backend.onrender.com")
    base = base.rstrip("/")
    req = urllib.request.Request(f"{base}/api/internal/export", headers={"x-internal-key": key})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as exc:  # noqa: BLE001 - mọi lỗi mạng đều fallback về dữ liệu giả lập
        print(f"[Data] Không lấy được dữ liệu thật từ Backend ({exc}) -> dùng dữ liệu giả lập")
        return None


def load_data(source: str = "auto"):
    """Trả về (products_df, interactions_df, thông tin nguồn dữ liệu)."""
    with open(DATA_DIR / "products.json", encoding="utf-8") as f:
        products_df = pd.DataFrame(json.load(f))

    real = fetch_real_data() if source != "synthetic" else None
    use_synth = os.getenv("USE_SYNTHETIC_BASE", "true").lower() != "false"

    frames, info = [], {"source": "synthetic", "n_real": 0, "n_real_users": 0, "n_synthetic": 0}

    if real is not None:
        if real.get("products"):
            products_df = pd.DataFrame(real["products"])
        real_df = pd.DataFrame(real.get("interactions", []), columns=INTERACTION_COLUMNS)
        real_df = real_df[real_df["product_id"].isin(products_df["id"])]
        info.update(source="real+synthetic" if use_synth else "real", n_real=int(len(real_df)),
                    n_real_users=int(real_df["user_id"].dropna().nunique()))
        frames.append(real_df)

    synth_path = DATA_DIR / "interactions.csv"
    if (real is None or use_synth) and synth_path.exists():
        synth_df = pd.read_csv(synth_path)
        info["n_synthetic"] = int(len(synth_df))
        frames.append(synth_df)

    interactions = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame(columns=INTERACTION_COLUMNS)
    interactions["rating_value"] = pd.to_numeric(interactions["rating_value"], errors="coerce")
    print(f"[Data] nguồn={info['source']} | thật={info['n_real']} ({info['n_real_users']} user) | giả lập={info['n_synthetic']}")
    return products_df, interactions, info


def build_content_based(products_df: pd.DataFrame):
    """TF-IDF trên (tên + mô tả + danh mục + thương hiệu) -> ma trận Cosine Similarity."""
    corpus = (
        products_df["name"].fillna("") + " " + products_df["description"].fillna("") + " "
        + products_df["category"].fillna("") + " " + products_df["brand"].fillna("")
    ).str.lower()
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)
    similarity_matrix = cosine_similarity(tfidf_matrix)
    joblib.dump(vectorizer, MODEL_DIR / "tfidf_vectorizer.joblib")
    np.save(MODEL_DIR / "content_similarity.npy", similarity_matrix)
    print(f"[Content-based] TF-IDF trên {len(products_df)} sản phẩm, ma trận {similarity_matrix.shape}")


def build_popularity(interactions: pd.DataFrame, products_df: pd.DataFrame):
    """Điểm phổ biến theo trọng số loại tương tác (gồm cả khách chưa đăng nhập)."""
    weights = {"view": 1, "cart": 2, "purchase": 3, "rating": 2}
    df = interactions.copy()
    df["weight"] = df["interaction_type"].map(weights).fillna(0)
    score = df.groupby("product_id")["weight"].sum()
    avg_rating = df.dropna(subset=["rating_value"]).groupby("product_id")["rating_value"].mean()

    pop_df = products_df[["id"]].copy()
    pop_df["popularity_score"] = pop_df["id"].map(score).fillna(0)
    pop_df["avg_rating"] = pop_df["id"].map(avg_rating).fillna(0)
    pop_df = pop_df.sort_values("popularity_score", ascending=False).reset_index(drop=True)
    pop_df.to_json(MODEL_DIR / "popularity.json", orient="records", force_ascii=False)
    print(f"[Popularity] Top 5: {pop_df['id'].head(5).tolist()}")


def build_collaborative(interactions: pd.DataFrame):
    """SVD trên ma trận User-Item. Chỉ dùng tương tác có user_id (khách vãng lai bị loại)."""
    df = interactions.dropna(subset=["user_id"]).copy()
    df["user_id"] = df["user_id"].astype(str)

    explicit = df[df["interaction_type"] == "rating"].dropna(subset=["rating_value"])
    implicit_map = {"view": 2.0, "cart": 3.0, "purchase": 4.5}
    implicit = df[df["interaction_type"].isin(implicit_map)].copy()
    implicit["rating_value"] = implicit["interaction_type"].map(implicit_map)

    combined = pd.concat([explicit, implicit])[["user_id", "product_id", "rating_value"]]
    combined = combined.groupby(["user_id", "product_id"], as_index=False)["rating_value"].mean()

    dataset = Dataset.load_from_df(combined, Reader(rating_scale=(1, 5)))
    algo = SVD(n_factors=20, random_state=42)
    cv = cross_validate(algo, dataset, measures=["RMSE", "MAE"], cv=5, verbose=False)

    trainset, testset = train_test_split(dataset, test_size=0.2, random_state=42)
    algo.fit(trainset)
    predictions = algo.test(testset)
    metrics = {
        "rmse_cv_mean": float(np.mean(cv["test_rmse"])),
        "mae_cv_mean": float(np.mean(cv["test_mae"])),
        "rmse_holdout": float(accuracy.rmse(predictions, verbose=False)),
        "mae_holdout": float(accuracy.mae(predictions, verbose=False)),
        "n_ratings_used": int(len(combined)),
        "n_users": int(combined["user_id"].nunique()),
    }
    joblib.dump(algo, MODEL_DIR / "svd_model.joblib")
    with open(MODEL_DIR / "collaborative_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"[Collaborative-SVD] RMSE(5-fold)={metrics['rmse_cv_mean']:.3f} MAE(5-fold)={metrics['mae_cv_mean']:.3f}")
    return metrics


def run_training(source: str = "auto") -> dict:
    """Huấn luyện toàn bộ và ghi artifact vào models/. Trả về bản tóm tắt."""
    products_df, interactions, info = load_data(source)
    products_df.to_json(MODEL_DIR / "products_index.json", orient="records", force_ascii=False)
    build_content_based(products_df)
    build_popularity(interactions, products_df)
    metrics = build_collaborative(interactions)

    summary = {**info, **metrics, "trained_at": datetime.now(timezone.utc).isoformat()}
    with open(MODEL_DIR / "training_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    return summary


if __name__ == "__main__":
    run_training(sys.argv[1] if len(sys.argv) > 1 else "auto")
    print("\nHoàn tất huấn luyện. Artifact tại:", MODEL_DIR.resolve())
