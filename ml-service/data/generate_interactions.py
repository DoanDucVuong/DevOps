"""
Sinh dữ liệu tương tác giả lập (Bảng Interactions, mục 3.2.3 báo cáo)
để có dữ liệu huấn luyện cho Collaborative Filtering.

Trong dự án thật, dữ liệu này lấy từ bảng Interactions do Backend ghi lại
mỗi khi người dùng view / add-to-cart / purchase / rating sản phẩm.
Ở đây ta mô phỏng 60 người dùng, mỗi người có một "khẩu vị" theo category
để tạo ra tín hiệu tương quan thực sự cho SVD học (nếu random hoàn toàn
thì Collaborative Filtering sẽ không có gì để học).
"""
import json
import random
import csv

random.seed(42)

with open("products.json", encoding="utf-8") as f:
    products = json.load(f)

categories = sorted(set(p["category"] for p in products))
n_users = 60

rows = []
for uid in range(1, n_users + 1):
    user_id = f"u{uid:03d}"
    # mỗi user thích 1-2 category chính (khẩu vị) + thỉnh thoảng thử ngẫu nhiên
    favorite_cats = random.sample(categories, k=random.choice([1, 2]))
    n_interactions = random.randint(8, 20)

    for _ in range(n_interactions):
        if random.random() < 0.75:
            cat = random.choice(favorite_cats)
            candidates = [p for p in products if p["category"] == cat]
        else:
            candidates = products
        product = random.choice(candidates)

        # Loại tương tác: view phổ biến nhất, purchase/rating ít hơn
        interaction_type = random.choices(
            ["view", "cart", "purchase", "rating"],
            weights=[0.55, 0.2, 0.15, 0.10],
        )[0]

        if interaction_type == "rating":
            # rating cao hơn nếu đúng khẩu vị, có nhiễu ngẫu nhiên
            base = 4.3 if product["category"] in favorite_cats else 3.0
            rating = max(1, min(5, round(random.gauss(base, 0.8))))
        else:
            rating = None

        rows.append({
            "user_id": user_id,
            "product_id": product["id"],
            "interaction_type": interaction_type,
            "rating_value": rating,
        })

with open("interactions.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["user_id", "product_id", "interaction_type", "rating_value"])
    writer.writeheader()
    writer.writerows(rows)

print(f"Đã sinh {len(rows)} bản ghi tương tác cho {n_users} người dùng -> interactions.csv")
