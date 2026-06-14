---
name: code-review
description: Structured code review checklist for correctness, security, and maintainability
group: GENERAL
tags: [review, quality, best-practices]
version: "1.0.0"
author: loitv
agents: [claude-code, kiro]
---

## Mục đích

Checklist code review có cấu trúc — bao gồm correctness, security, maintainability, và performance.

## Checklist

### Correctness
- [ ] Logic đúng với requirement?
- [ ] Edge cases xử lý (null, empty, overflow)?
- [ ] Error handling đủ và đúng level?
- [ ] Tests cover happy path + failure path?

### Security
- [ ] Không có hardcoded secrets/credentials
- [ ] Input validation tại system boundary
- [ ] Không có SQL injection / XSS risk
- [ ] Auth/authz check đúng chỗ
- [ ] Sensitive data không log ra

### Maintainability
- [ ] Naming rõ ràng (biến, hàm, class)
- [ ] Hàm single responsibility, không quá dài (> 50 lines → xem xét)
- [ ] Không duplicate logic (DRY)
- [ ] Comment chỉ khi WHY không rõ từ code

### Performance
- [ ] Không có N+1 query
- [ ] Không load toàn bộ dataset vào memory nếu không cần
- [ ] Vòng lặp không có side effect không cần thiết

### API / Interface
- [ ] Breaking change? Có backward compat không?
- [ ] Response schema nhất quán
- [ ] Error response có message hữu ích

## Severity levels khi comment

| Level | Khi nào |
|---|---|
| `BLOCKER` | Bug, security issue, data loss risk |
| `MAJOR` | Logic sai nhưng không crash, bad pattern |
| `MINOR` | Improvement nhỏ, style |
| `NIT` | Typo, formatting — optional fix |

## Format comment

```
[LEVEL] path/file.py:42
Problem: ...
Fix: ...
```

## Hướng dẫn sử dụng với Claude Code

```
/code-review — Claude review diff hiện tại với checklist này
/code-review --fix — Claude tự apply fix sau review
```
