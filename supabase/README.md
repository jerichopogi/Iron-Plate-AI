# Supabase Database Setup Guide

This directory contains all database migrations and configuration for the IronPlate AI application.

## Overview

The database schema consists of 7 tables with Row Level Security (RLS) policies to ensure users can only access their own data:

1. **users** - Extended user profiles from Supabase Auth
2. **workout_plans** - AI-generated workout plans
3. **meal_plans** - AI-generated meal plans
4. **workout_logs** - Completed workout tracking
5. **progress_logs** - Weight and PR tracking
6. **grocery_lists** - Weekly grocery lists from meal plans
7. **exercise_swaps** - Exercise swap history

## Prerequisites

1. Create a Supabase project at [https://app.supabase.com](https://app.supabase.com)
2. Get your project credentials:
   - Project URL (Settings > API > Project URL)
   - Anon/Public Key (Settings > API > Project API keys > anon public)
   - Service Role Key (for migrations - Settings > API > Project API keys > service_role)

## Quick Start

### Option 1: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `migrations/001_initial_schema.sql`
5. Paste into the SQL Editor and click **Run**
6. Wait for completion message: "Schema migration completed successfully"
7. Create another new query
8. Copy the contents of `migrations/002_rls_policies.sql`
9. Paste and click **Run**
10. Wait for completion message: "RLS migration completed successfully"

### Option 2: Using Supabase CLI (Recommended for production)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize Supabase in your project (skip if already done):
```bash
supabase init
```

3. Link to your remote project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. Copy migration files to the Supabase migrations directory:
```bash
cp supabase/migrations/*.sql supabase/supabase/migrations/
```

5. Push migrations to remote:
```bash
supabase db push
```

### Option 3: Manual SQL Execution

1. Connect to your Supabase database using your preferred SQL client
2. Execute `migrations/001_initial_schema.sql` first
3. Execute `migrations/002_rls_policies.sql` second
4. Verify migrations completed successfully

## Environment Variables

After setting up the database, add these credentials to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

You can find these in:
- Supabase Dashboard > Settings > API

## Database Schema

### Entity Relationship Diagram

```
auth.users (Supabase Auth)
    ↓
users (Extended Profile)
    ↓
    ├── workout_plans (1:many, CASCADE)
    ├── meal_plans (1:many, CASCADE)
    ├── workout_logs (1:many, CASCADE)
    ├── progress_logs (1:many, CASCADE)
    ├── grocery_lists (1:many, CASCADE)
    └── exercise_swaps (1:many, CASCADE)
```

### Table Details

#### 1. users
- **Purpose**: Extended user profiles with fitness data
- **Key Fields**: id (uuid, FK to auth.users), email, profile_data (JSONB)
- **Constraints**: Unique email
- **RLS**: Users can only access their own profile

#### 2. workout_plans
- **Purpose**: Store AI-generated workout plans
- **Key Fields**: user_id, plan_data (JSONB), active (boolean)
- **Constraints**: Only one active plan per user
- **RLS**: Users can only access their own plans

#### 3. meal_plans
- **Purpose**: Store AI-generated meal plans
- **Key Fields**: user_id, plan_data (JSONB), active (boolean)
- **Constraints**: Only one active plan per user
- **RLS**: Users can only access their own plans

#### 4. workout_logs
- **Purpose**: Track completed workouts
- **Key Fields**: user_id, workout_date, exercises (JSONB)
- **Constraints**: Unique (user_id, workout_date) - one workout per day
- **RLS**: Users can only access their own logs

#### 5. progress_logs
- **Purpose**: Track weight and personal records
- **Key Fields**: user_id, log_type ('weight'|'pr'), exercise, value, date
- **Constraints**: PR exercises limited to 'bench_press', 'squat', 'deadlift'
- **RLS**: Users can only access their own logs

#### 6. grocery_lists
- **Purpose**: Weekly grocery lists from meal plans
- **Key Fields**: user_id, items (JSONB), week_start_date
- **Constraints**: Unique (user_id, week_start_date)
- **RLS**: Users can only access their own lists

#### 7. exercise_swaps
- **Purpose**: Track exercise swaps for analytics
- **Key Fields**: user_id, workout_date, original_exercise, swapped_exercise
- **Constraints**: None (multiple swaps allowed per day, up to 3 enforced in app logic)
- **RLS**: Users can only access their own swaps

## Helper Functions

### get_swap_count(user_id, workout_date)
Returns the number of exercise swaps for a specific user on a specific date.

**Usage:**
```sql
SELECT get_swap_count('user-uuid-here', '2026-01-20');
```

**Returns:** INTEGER (0-3 typically, enforced by app)

### deactivate_old_plans(user_id, plan_type)
Deactivates all active plans before creating a new one.

**Usage:**
```sql
SELECT deactivate_old_plans('user-uuid-here', 'workout');
SELECT deactivate_old_plans('user-uuid-here', 'meal');
```

**Returns:** VOID (updates active = false on matching plans)

## Row Level Security (RLS) Policies

All tables have RLS enabled with 4 policies each:

1. **SELECT**: Users can view their own data (`user_id = auth.uid()`)
2. **INSERT**: Users can insert their own data (`user_id = auth.uid()`)
3. **UPDATE**: Users can update their own data (`user_id = auth.uid()`)
4. **DELETE**: Users can delete their own data (`user_id = auth.uid()`)

### Testing RLS

To verify RLS is working:

1. Create two test users
2. Insert data for User A
3. Try to query as User B
4. User B should see no results (RLS blocks access)

## Indexes

The following indexes are created for performance:

- **users**: id, email
- **workout_plans**: user_id, (user_id, active) WHERE active = true
- **meal_plans**: user_id, (user_id, active) WHERE active = true
- **workout_logs**: user_id, (user_id, workout_date DESC), (user_id, completed_at DESC)
- **progress_logs**: user_id, (user_id, log_type), (user_id, date DESC), (user_id, exercise)
- **grocery_lists**: user_id, (user_id, week_start_date DESC)
- **exercise_swaps**: user_id, (user_id, workout_date), created_at DESC

## Triggers

### update_updated_at_column
Automatically updates the `updated_at` timestamp when a row is modified.

**Applied to:**
- users
- grocery_lists

## Data Integrity Constraints

1. **Foreign Keys**: All user_id fields reference users(id) with ON DELETE CASCADE
2. **Unique Constraints**:
   - users: email
   - workout_plans: (user_id) WHERE active = true
   - meal_plans: (user_id) WHERE active = true
   - workout_logs: (user_id, workout_date)
   - grocery_lists: (user_id, week_start_date)
3. **Check Constraints**:
   - progress_logs: log_type IN ('weight', 'pr')
   - progress_logs: IF log_type = 'pr' THEN exercise IN ('bench_press', 'squat', 'deadlift')

## Troubleshooting

### Migration Failed: Table already exists
If you've run migrations before and need to reset:

```sql
-- WARNING: This deletes all data
DROP TABLE IF EXISTS exercise_swaps CASCADE;
DROP TABLE IF EXISTS grocery_lists CASCADE;
DROP TABLE IF EXISTS progress_logs CASCADE;
DROP TABLE IF EXISTS workout_logs CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS workout_plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS get_swap_count CASCADE;
DROP FUNCTION IF EXISTS deactivate_old_plans CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

Then re-run migrations.

### RLS Policies Not Working
Check if RLS is enabled:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

### Missing Permissions
Grant authenticated users access:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

## Next Steps

After completing database setup:

1. ✅ Verify migrations completed successfully
2. ✅ Add environment variables to `.env.local`
3. ✅ Test Supabase client connection
4. → Proceed to Task 3: Authentication setup

## Verification Checklist

- [ ] All 7 tables created successfully
- [ ] RLS enabled on all tables (28 policies total)
- [ ] Indexes created on key fields
- [ ] Foreign key relationships working (CASCADE delete)
- [ ] Unique constraints enforced
- [ ] Helper functions callable
- [ ] Triggers updating timestamps
- [ ] Supabase client can connect from Next.js app

## Support

For issues:
- Check Supabase logs: Dashboard > Database > Logs
- Verify RLS policies: Dashboard > Authentication > Policies
- Test queries: Dashboard > SQL Editor

## Schema Version

- **Version**: 2.0
- **Last Updated**: 2026-01-20
- **Migrations**: 2 files (001_initial_schema.sql, 002_rls_policies.sql)
