---
name: eda-starter
description: Quy trình EDA chuẩn cho dataset mới — profiling, missing values, distributions, correlations, outliers.
group: DA
tags: [eda, pandas, visualization, data-analysis]
version: "1.0.0"
author: loitv
agents: [claude-code]
---

## Mục đích

Quy trình EDA chuẩn cho dataset mới — profiling, missing values, distributions, correlations, outliers.

## Step-by-step

### 1. Load & quick overview

```python
import pandas as pd
import numpy as np

df = pd.read_csv("data.csv")

print(df.shape)          # (rows, cols)
print(df.dtypes)         # kiểu dữ liệu từng cột
print(df.head())
print(df.describe())     # thống kê cột numeric
```

### 2. Missing values

```python
missing = df.isnull().sum()
missing_pct = (missing / len(df) * 100).round(2)
print(missing_pct[missing_pct > 0].sort_values(ascending=False))

# Rule of thumb:
# > 50% missing → cân nhắc drop column
# < 5% missing → impute (median/mode/mean)
# 5-50% → tùy context
```

### 3. Distributions

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Numeric
df.hist(bins=30, figsize=(15, 10))
plt.tight_layout()

# Categorical
for col in df.select_dtypes(include='object').columns:
    print(df[col].value_counts().head(10))
```

### 4. Correlations

```python
corr = df.select_dtypes(include=np.number).corr()
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm')
plt.title("Correlation Matrix")
```

### 5. Outliers

```python
from scipy import stats

numeric_cols = df.select_dtypes(include=np.number).columns
z_scores = np.abs(stats.zscore(df[numeric_cols].dropna()))
outliers = (z_scores > 3).sum(axis=0)
print("Outliers per column (z > 3):", outliers)

# IQR method
Q1 = df[numeric_cols].quantile(0.25)
Q3 = df[numeric_cols].quantile(0.75)
IQR = Q3 - Q1
print("IQR outliers:", ((df[numeric_cols] < Q1 - 1.5*IQR) | (df[numeric_cols] > Q3 + 1.5*IQR)).sum())
```

### 6. Target variable (nếu có)

```python
target = 'label'  # thay tên cột target

# Classification
print(df[target].value_counts(normalize=True))

# Regression
sns.histplot(df[target], kde=True)
print(f"Skew: {df[target].skew():.3f}")
```

## Checklist kết quả EDA

- [ ] Shape, dtypes đã kiểm tra
- [ ] Missing values đã map và có kế hoạch xử lý
- [ ] Distributions nhìn bất thường → đã note
- [ ] Correlations cao (> 0.9) giữa features → xem xét drop
- [ ] Outliers đã phát hiện → quyết định keep/cap/remove
- [ ] Target distribution đã hiểu (imbalanced? skewed?)

## Hướng dẫn sử dụng với Claude Code

```
/eda-starter — Claude sẽ chạy EDA trên dataset bạn chỉ định
```
