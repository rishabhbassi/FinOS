// FinOS - Constants

export const INCOME_CATEGORIES = [
  'Salary', 'Bonus', 'Freelancing', 'Refund', 'Interest', 'Dividend', 'Other Income'
] as const;

export const EXPENSE_CATEGORIES = [
  'Food', 'Groceries', 'Fuel', 'Rent', 'Electricity', 'Internet',
  'Shopping', 'Entertainment', 'Medical', 'Travel', 'Education',
  'Gift', 'Subscription', 'Bills', 'EMI', 'Insurance', 'Misc'
] as const;

export const ACCOUNT_TYPES = [
  'savings', 'current', 'credit', 'cash', 'wallet', 'upi'
] as const;

export const INVESTMENT_TYPES = [
  'sip', 'stock', 'mutual_fund', 'fd', 'ppf', 'gold', 'crypto', 'other'
] as const;

export const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
] as const;

export const BUDGET_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'fixed', label: 'Fixed' },
] as const;

export const STATUS_COLORS = {
  comfortable: { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  tight: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  over: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
} as const;

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'layout-dashboard' },
  { href: '/planner', label: 'Planner', icon: 'calendar-check-2' },
  { href: '/transactions', label: 'Transactions', icon: 'arrow-left-right' },
  { href: '/budget', label: 'Budget', icon: 'wallet' },
  { href: '/investments', label: 'Investments', icon: 'trending-up' },
  { href: '/goals', label: 'Goals', icon: 'target' },
  { href: '/reports', label: 'Reports', icon: 'bar-chart-3' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
] as const;
