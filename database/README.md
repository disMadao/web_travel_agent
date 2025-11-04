# 数据库设置

本项目使用 Supabase 作为数据库和认证服务。

## Supabase 设置步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并注册账号
2. 创建新项目
3. 等待项目初始化完成

### 2. 获取 API 凭证

在项目设置中找到：
- **Project URL**: `https://xxx.supabase.co`
https://hkviwlnhhgmutszeuvrg.supabase.co
- **Anon Key**: 公开的匿名密钥：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrdml3bG5oaGdtdXRzemV1dnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDQ1NzAsImV4cCI6MjA3NjM4MDU3MH0.sme8bLgqlO4ka2jsuIXMAN_Gxb_fGYUdYWgOzI8DAyc



将这些信息填入：
- 后端的 `.env` 文件
- 前端的 `.env.local` 文件

### 3. 初始化数据库

1. 在 Supabase 项目中，打开 **SQL Editor**
2. 复制 `supabase_setup.sql` 文件的内容
3. 粘贴到 SQL Editor 并执行

这将创建：
- `trips` 表（行程）
- `expenses` 表（费用记录）
- 必要的索引
- 行级安全策略（RLS）
- 触发器和视图

### 4. 配置认证

在 Supabase 项目的 **Authentication** 设置中：

1. **Email Auth**: 确保已启用邮箱认证
2. **Email Templates**: 可自定义确认邮件、重置密码邮件等模板
3. **Redirect URLs**: 添加您的前端 URL（如 `http://localhost:5173`）

### 5. （可选）配置存储

如果需要上传图片（如行程照片），可以在 **Storage** 中创建存储桶：

```sql
-- 创建公开的存储桶用于行程图片
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trip-images', 'trip-images', true);

-- 设置存储策略
CREATE POLICY "Anyone can view trip images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'trip-images');

CREATE POLICY "Authenticated users can upload trip images" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'trip-images' AND auth.role() = 'authenticated');
```

## 数据库架构

### trips 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID（外键） |
| title | TEXT | 行程标题 |
| destination | TEXT | 目的地 |
| start_date | DATE | 开始日期 |
| end_date | DATE | 结束日期 |
| total_days | INTEGER | 总天数 |
| budget | DECIMAL | 预算 |
| travelers | INTEGER | 人数 |
| preferences | JSONB | 偏好列表 |
| has_children | BOOLEAN | 是否带孩子 |
| daily_itineraries | JSONB | 每日行程 |
| accommodations | JSONB | 住宿信息 |
| estimated_costs | JSONB | 预估费用明细 |
| total_estimated_cost | DECIMAL | 总预估费用 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### expenses 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID（外键） |
| trip_id | UUID | 行程ID（外键） |
| category | TEXT | 费用类别 |
| amount | DECIMAL | 金额 |
| description | TEXT | 描述 |
| date | DATE | 日期 |
| location | TEXT | 地点（可选） |
| notes | TEXT | 备注（可选） |
| created_at | TIMESTAMP | 创建时间 |

## 行级安全策略 (RLS)

所有表都启用了行级安全策略，确保：
- 用户只能访问自己的数据
- 防止未授权访问
- 自动验证请求者身份

## 查询示例

### 获取用户的所有行程

```sql
SELECT * FROM trips 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;
```

### 获取行程的总花费

```sql
SELECT 
  t.id,
  t.title,
  t.budget,
  COALESCE(SUM(e.amount), 0) as total_spent
FROM trips t
LEFT JOIN expenses e ON t.id = e.trip_id
WHERE t.user_id = auth.uid()
GROUP BY t.id, t.title, t.budget;
```

### 按类别统计费用

```sql
SELECT 
  category,
  COUNT(*) as count,
  SUM(amount) as total
FROM expenses
WHERE trip_id = 'your-trip-id' AND user_id = auth.uid()
GROUP BY category;
```

## 备份和恢复

Supabase 提供自动备份功能（付费计划）。也可以手动导出数据：

```sql
-- 导出行程数据
COPY trips TO '/path/to/trips.csv' WITH CSV HEADER;

-- 导出费用数据
COPY expenses TO '/path/to/expenses.csv' WITH CSV HEADER;
```

## 性能优化建议

1. **使用索引**: 已为常用查询字段创建索引
2. **JSONB 查询优化**: 对频繁查询的 JSONB 字段创建 GIN 索引
3. **连接池**: 使用 Supabase 的连接池功能
4. **缓存**: 在应用层实现适当的缓存策略

## 监控和维护

在 Supabase Dashboard 中可以：
- 查看数据库性能指标
- 监控查询性能
- 查看日志
- 设置警报

## 故障排除

### 问题: RLS 策略导致无法访问数据
解决: 确保在查询时已正确设置认证 token

### 问题: JSONB 字段查询慢
解决: 为 JSONB 字段创建 GIN 索引

```sql
CREATE INDEX idx_trips_preferences ON trips USING GIN (preferences);
```

### 问题: 连接超时
解决: 检查网络连接，或使用 Supabase 的连接池

## 相关链接

- [Supabase 文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

