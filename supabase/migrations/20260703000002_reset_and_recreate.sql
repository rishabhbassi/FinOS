-- Reset: drop all tables in public schema and recreate from scratch
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Recreate tables from the original schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'INR',
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('savings','current','credit','cash','upi','investment')),
  balance DECIMAL(12,2) DEFAULT 0,
  credit_limit DECIMAL(12,2),
  billing_date INT CHECK (billing_date BETWEEN 1 AND 31),
  due_date INT CHECK (due_date BETWEEN 1 AND 31),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  icon TEXT DEFAULT 'circle',
  color TEXT DEFAULT '#6b7280',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id TEXT,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  merchant TEXT,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  is_recurring BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Budget Rules
CREATE TABLE budget_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily','weekly','monthly','yearly')),
  amount DECIMAL(12,2) NOT NULL,
  day_multiplier INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Recurring Expenses
CREATE TABLE recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id TEXT,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly','monthly','quarterly','yearly')),
  day_of_month INT CHECK (day_of_month BETWEEN 1 AND 31),
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Investments
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  ticker TEXT,
  quantity DECIMAL(12,4) DEFAULT 0,
  buy_price DECIMAL(12,2) DEFAULT 0,
  current_price DECIMAL(12,2) DEFAULT 0,
  returns DECIMAL(12,2) DEFAULT 0,
  allocation DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  deadline DATE,
  icon TEXT DEFAULT 'target',
  color TEXT DEFAULT '#22c55e',
  monthly_contribution DECIMAL(12,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Monthly Snapshots (for historical analysis)
CREATE TABLE monthly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  total_income DECIMAL(12,2) DEFAULT 0,
  total_expenses DECIMAL(12,2) DEFAULT 0,
  savings DECIMAL(12,2) DEFAULT 0,
  savings_rate DECIMAL(5,2) DEFAULT 0,
  net_worth DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own categories" ON categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own budget rules" ON budget_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own recurring" ON recurring_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own investments" ON investments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own snapshots" ON monthly_snapshots FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-create system categories
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO categories (user_id, name, type, icon, color, is_system) VALUES
    (NEW.id, 'Salary', 'income', 'wallet', '#22c55e', true),
    (NEW.id, 'Bonus', 'income', 'gift', '#16a34a', true),
    (NEW.id, 'Freelancing', 'income', 'laptop', '#15803d', true),
    (NEW.id, 'Refund', 'income', 'undo-2', '#166534', true),
    (NEW.id, 'Interest', 'income', 'percent', '#14532d', true),
    (NEW.id, 'Dividend', 'income', 'banknote', '#0f766e', true),
    (NEW.id, 'Other Income', 'income', 'plus-circle', '#4f46e5', true);
  INSERT INTO categories (user_id, name, type, icon, color, is_system) VALUES
    (NEW.id, 'Food', 'expense', 'utensils-crossed', '#ef4444', true),
    (NEW.id, 'Groceries', 'expense', 'shopping-cart', '#dc2626', true),
    (NEW.id, 'Fuel', 'expense', 'fuel', '#f97316', true),
    (NEW.id, 'Rent', 'expense', 'home', '#eab308', true),
    (NEW.id, 'Electricity', 'expense', 'zap', '#84cc16', true),
    (NEW.id, 'Internet', 'expense', 'wifi', '#22c55e', true),
    (NEW.id, 'Shopping', 'expense', 'shopping-bag', '#ec4899', true),
    (NEW.id, 'Entertainment', 'expense', 'clapperboard', '#f43f5e', true),
    (NEW.id, 'Medical', 'expense', 'heart-pulse', '#ef4444', true),
    (NEW.id, 'Travel', 'expense', 'plane', '#8b5cf6', true),
    (NEW.id, 'Education', 'expense', 'graduation-cap', '#6366f1', true),
    (NEW.id, 'Gift', 'expense', 'gift', '#d946ef', true),
    (NEW.id, 'Subscription', 'expense', 'repeat', '#a855f7', true),
    (NEW.id, 'Bills', 'expense', 'file-text', '#0ea5e9', true),
    (NEW.id, 'EMI', 'expense', 'landmark', '#0284c7', true),
    (NEW.id, 'Insurance', 'expense', 'shield', '#2563eb', true),
    (NEW.id, 'Misc', 'expense', 'more-horizontal', '#6b7280', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created_categories
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_categories();

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_budget_rules_updated_at
  BEFORE UPDATE ON budget_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_recurring_updated_at
  BEFORE UPDATE ON recurring_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
