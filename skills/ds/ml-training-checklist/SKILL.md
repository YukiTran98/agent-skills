---
name: ml-training-checklist
description: Pre/post training checklist — data split, baseline, metrics, overfitting, reproducibility
group: DS
tags: [machine-learning, training, checklist, mlops]
version: "1.0.0"
author: loitv
agents: [claude-code]
---

## Mục đích

Checklist trước và sau khi train model ML — data split, baseline, metrics, overfitting, reproducibility.

## Pre-training Checklist

### Data
- [ ] Data split đã thực hiện (train/val/test) trước mọi xử lý
- [ ] Không có data leakage — test set hoàn toàn unseen
- [ ] Stratified split nếu imbalanced dataset
- [ ] Distribution của train/val/test tương đồng nhau
- [ ] Preprocessing fit trên train, transform trên val/test

### Baseline
- [ ] Đã thiết lập dummy baseline (random, majority class, mean prediction)
- [ ] Biết metric target cần đạt để "beat baseline"

### Reproducibility
- [ ] Random seed đã set (numpy, random, framework seed)
- [ ] `requirements.txt` / `pyproject.toml` pin version đầy đủ
- [ ] Data version đã ghi lại (path, hash, hoặc DVC tag)

### Experiment tracking
- [ ] MLflow / W&B experiment đã tạo và named rõ ràng
- [ ] Hyperparameters log đủ (`mlflow.log_params(...)`)

## Training

```python
import numpy as np
import random

SEED = 42
np.random.seed(SEED)
random.seed(SEED)

# PyTorch
import torch
torch.manual_seed(SEED)

# sklearn
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=SEED, stratify=y
)
```

## Post-training Checklist

### Metrics
- [ ] Đánh giá trên **test set** (không phải val)
- [ ] Metric phù hợp với business goal (F1 vs AUC vs Precision?)
- [ ] Per-class metrics (classification) — không chỉ overall accuracy
- [ ] Confidence interval hoặc cross-val score nếu dataset nhỏ

### Overfitting check
- [ ] Train metric vs Val metric chênh lệch < 5%? (nếu lớn hơn → overfit)
- [ ] Learning curve đã vẽ (loss vs epochs)
- [ ] Regularization đã thử (dropout, L2, early stopping)

### Error analysis
- [ ] Xem 20-30 prediction sai → tìm pattern
- [ ] Confusion matrix (classification)
- [ ] Residual plot (regression)

### Model artifacts
- [ ] Model file đã save (với version + date trong tên)
- [ ] Feature list đã save — đảm bảo inference dùng đúng columns
- [ ] Preprocessing pipeline đã save (scaler, encoder)

## Metrics reference

| Task | Primary metric | Secondary |
|---|---|---|
| Binary classification | AUC-ROC | F1, Precision, Recall |
| Multiclass | Macro F1 | Per-class F1 |
| Imbalanced | F1 / PR-AUC | Không dùng accuracy |
| Regression | RMSE | MAE, R² |

## Hướng dẫn sử dụng với Claude Code

```
/ml-training-checklist — Claude review training setup và flag issues
```
