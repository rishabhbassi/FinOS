-- Fix: Add search_path to SECURITY DEFINER functions
-- Without SET search_path, trigger functions on auth.users run in the
-- auth schema context and can't find public.tables

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

CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Income categories
  INSERT INTO categories (user_id, name, type, icon, color, is_system) VALUES
    (NEW.id, 'Salary', 'income', 'wallet', '#22c55e', true),
    (NEW.id, 'Bonus', 'income', 'gift', '#16a34a', true),
    (NEW.id, 'Freelancing', 'income', 'laptop', '#15803d', true),
    (NEW.id, 'Refund', 'income', 'undo-2', '#166534', true),
    (NEW.id, 'Interest', 'income', 'percent', '#14532d', true),
    (NEW.id, 'Dividend', 'income', 'banknote', '#0f766e', true),
    (NEW.id, 'Other Income', 'income', 'plus-circle', '#4f46e5', true);
  -- Expense categories
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
