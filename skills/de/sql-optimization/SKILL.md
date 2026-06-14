---
name: sql-optimization
description: Optimize SQL queries for large datasets — indexes, query plans, anti-patterns
group: DE
tags: [sql, performance, database]
version: "1.0.0"
author: loitv
agents: [claude-code, kiro]
---

## Mục đích

Optimize SQL queries cho large datasets — indexes, query plans, common anti-patterns.

## Anti-patterns cần tránh

### SELECT *
```sql
-- Xấu: load toàn bộ columns
SELECT * FROM orders WHERE status = 'pending';

-- Tốt: chỉ lấy columns cần
SELECT id, customer_id, total, created_at FROM orders WHERE status = 'pending';
```

### N+1 Query
```sql
-- Xấu: query trong loop
SELECT * FROM users;
-- rồi với mỗi user: SELECT * FROM orders WHERE user_id = ?

-- Tốt: JOIN một lần
SELECT u.id, u.name, o.id AS order_id, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;
```

### Functions trên indexed column
```sql
-- Xấu: index không dùng được
WHERE YEAR(created_at) = 2024

-- Tốt: range query dùng được index
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'
```

### LIKE với leading wildcard
```sql
-- Xấu: full table scan
WHERE name LIKE '%john%'

-- Tốt nếu cần full-text: dùng FULLTEXT index hoặc Elasticsearch
```

## Index best practices

```sql
-- Tạo index cho WHERE clause thường xuyên
CREATE INDEX idx_orders_status ON orders(status);

-- Composite index: thứ tự quan trọng (most selective first)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Covering index (bao gồm cả SELECT columns)
CREATE INDEX idx_orders_covering ON orders(user_id, status, total, created_at);
```

## EXPLAIN / Query Plan

```sql
-- MySQL / PostgreSQL
EXPLAIN SELECT ...;
EXPLAIN ANALYZE SELECT ...;  -- PostgreSQL: chạy thật + thống kê

-- Xem key metrics:
-- rows scanned (thấp = tốt)
-- type: ALL (bad) → range → ref → eq_ref → const (best)
-- Extra: "Using filesort" / "Using temporary" → cần optimize
```

## Pagination

```sql
-- Xấu với offset lớn: phải scan N rows trước
SELECT * FROM orders LIMIT 20 OFFSET 10000;

-- Tốt: keyset pagination
SELECT * FROM orders
WHERE id > :last_seen_id
ORDER BY id ASC
LIMIT 20;
```

## Aggregation tips

```sql
-- Dùng CTE để tách logic rõ ràng
WITH monthly_revenue AS (
  SELECT DATE_TRUNC('month', created_at) AS month,
         SUM(total) AS revenue
  FROM orders
  WHERE status = 'completed'
  GROUP BY 1
)
SELECT month, revenue,
       LAG(revenue) OVER (ORDER BY month) AS prev_revenue
FROM monthly_revenue;
```

## Checklist trước khi merge query

- [ ] `EXPLAIN` đã chạy — không có full table scan trên large table
- [ ] Index đã có cho tất cả WHERE / JOIN columns
- [ ] Không có function wrap trên indexed column
- [ ] Pagination dùng keyset (nếu offset > 1000)
- [ ] SELECT chỉ lấy columns cần thiết

## Hướng dẫn sử dụng với Claude Code

```
/sql-optimization — paste query, Claude analyze và suggest optimization
```
