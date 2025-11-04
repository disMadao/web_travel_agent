-- Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中运行此脚本

-- 创建行程表
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  budget DECIMAL NOT NULL,
  travelers INTEGER NOT NULL,
  preferences JSONB DEFAULT '[]'::jsonb,
  has_children BOOLEAN DEFAULT FALSE,
  daily_itineraries JSONB DEFAULT '[]'::jsonb,
  accommodations JSONB DEFAULT '[]'::jsonb,
  estimated_costs JSONB DEFAULT '{}'::jsonb,
  total_estimated_cost DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建费用表
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- 启用行级安全策略 (Row Level Security)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 创建 trips 表的 RLS 策略
-- 用户只能查看自己的行程
CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的行程
CREATE POLICY "Users can insert own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的行程
CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的行程
CREATE POLICY "Users can delete own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);

-- 创建 expenses 表的 RLS 策略
-- 用户只能查看自己的费用记录
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的费用记录
CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的费用记录
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的费用记录
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- 创建触发器，自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建视图：用户行程统计
CREATE OR REPLACE VIEW user_trip_stats AS
SELECT 
  user_id,
  COUNT(*) as total_trips,
  SUM(budget) as total_budget,
  SUM(total_estimated_cost) as total_estimated_cost
FROM trips
GROUP BY user_id;

-- 创建视图：行程费用汇总
CREATE OR REPLACE VIEW trip_expense_summary AS
SELECT 
  e.trip_id,
  e.user_id,
  COUNT(*) as expense_count,
  SUM(e.amount) as total_spent,
  t.budget,
  t.budget - SUM(e.amount) as remaining_budget
FROM expenses e
JOIN trips t ON e.trip_id = t.id
GROUP BY e.trip_id, e.user_id, t.budget;

-- 插入一些示例数据（可选，用于测试）
-- 注意：需要替换 user_id 为实际的用户 ID
-- INSERT INTO trips (user_id, title, destination, start_date, end_date, total_days, budget, travelers, preferences)
-- VALUES (
--   'your-user-id',
--   '日本东京5日游',
--   '东京',
--   '2024-06-01',
--   '2024-06-05',
--   5,
--   10000,
--   2,
--   '["food", "anime"]'::jsonb
-- );

