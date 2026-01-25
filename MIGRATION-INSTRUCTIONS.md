# Schools Database Split Migration Guide

## Overview
This migration splits the single `schools` table into 4 separate tables (`schools1`, `schools2`, `schools3`, `schools4`) to avoid out-of-memory errors when querying large datasets.

## What Has Been Done

### 1. Schema Updated ✅
- Created `schools1` (Basic Info & Contact)
- Created `schools2` (Academic & Sports Facilities)  
- Created `schools3` (Technology, Transport & Safety)
- Created `schools4` (Media, Ratings & Legacy)
- Updated foreign key references in other tables to point to `schools1`

### 2. Helper Functions Created ✅
File: `src/db/schoolsHelper.ts`
- `getSchool(id)` - Fetches and merges data from all 4 tables
- `getAllSchools(filters)` - Lists schools with filtering
- `createSchool(data)` - Creates entries across all 4 tables
- `updateSchool(id, data)` - Updates across appropriate tables
- `deleteSchool(id)` - Deletes from all 4 tables
- `getSchoolCount(filters)` - Counts schools

### 3. Main API Route Updated ✅
File: `src/app/api/schools/route.ts`
- Now uses helper functions instead of direct queries
- Handles GET (single/multiple/list), POST, and PUT operations

### 4. SQL Migration Script Created ✅
File: `migration-split-schools.sql`
- Copies data from `schools` to `schools1`, `schools2`, `schools3`, `schools4`
- Includes verification query

## Migration Steps

### Step 1: Generate and Push Drizzle Migrations
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

When prompted about `schools1`:
- Select "+ schools1 create table" (NOT rename)
- Repeat for schools2, schools3, schools4

### Step 2: Run Data Migration Script
Execute the SQL migration script against your Turso database:

```bash
# Option 1: Using turso CLI
turso db shell <your-db-name> < migration-split-schools.sql

# Option 2: Copy/paste into Turso dashboard SQL editor
# Go to your Turso dashboard and run the migration script
```

### Step 3: Verify Data Migration
Check that all data was copied successfully:
```sql
SELECT 
  (SELECT COUNT(*) FROM schools) as original_count,
  (SELECT COUNT(*) FROM schools1) as schools1_count,
  (SELECT COUNT(*) FROM schools2) as schools2_count,
  (SELECT COUNT(*) FROM schools3) as schools3_count,
  (SELECT COUNT(*) FROM schools4) as schools4_count;
```

All counts should match!

### Step 4: Update Remaining API Routes

The following API routes still reference the old `schools` table and need to be updated:

**Critical (Need immediate update):**
- `src/app/api/schools/[id]/route.ts` - Use `getSchool()` helper
- `src/app/api/schools/profile/route.ts` - Use `getSchool()` and `updateSchool()`
- `src/app/api/schools/featured/route.ts` - Use `getAllSchools()` helper
- `src/app/api/schools/spotlight/route.ts` - Use `getSchool()` helper
- `src/app/api/schools/visibility/route.ts` - Use `updateSchool()` helper

**Medium Priority:**
- `src/app/api/admin/schools/route.ts` - Use helper functions
- `src/app/api/admin/settings/spotlight/route.ts` - Use helper functions
- `src/app/api/chat/route.ts` - Update school queries
- `src/app/api/enquiries/route.ts` - Update school joins

### Step 5: Test the Application
1. Restart the dev server
2. Test school listing page (`/schools`)
3. Test individual school page (`/schools/[id]`)
4. Test school dashboard
5. Test search and filtering
6. Test school profile updates

### Step 6: Drop Old Schools Table (After Testing)
Once everything is working:
```sql
DROP TABLE schools;
```

## How to Update Other API Routes

Replace direct `schools` table queries with helper functions:

### Before:
```typescript
import { schools } from '@/db/schema';

const school = await db.select()
  .from(schools)
  .where(eq(schools.id, id))
  .limit(1);
```

### After:
```typescript
import { getSchool } from '@/db/schoolsHelper';

const school = await getSchool(id);
```

### For Updates:
```typescript
// Before
await db.update(schools)
  .set({ name: 'New Name' })
  .where(eq(schools.id, id));

// After
await updateSchool(id, { name: 'New Name' });
```

## Troubleshooting

### Issue: "Column not found" errors
- **Cause**: Some API routes still querying old `schools` table
- **Fix**: Update those routes to use helper functions

### Issue: Missing data in responses
- **Cause**: Data not migrated properly
- **Fix**: Re-run migration script Step 2

### Issue: Foreign key errors
- **Cause**: Old references to `schools` table
- **Fix**: Already updated in schema.ts to point to `schools1`

## Rollback Plan

If you need to rollback:
1. Keep the old `schools` table (don't drop it)
2. Revert code changes from this PR
3. Drop the new tables: `DROP TABLE schools1, schools2, schools3, schools4`

## Performance Benefits

- **Before**: Single large table with 100+ columns
- **After**: 4 smaller tables with 20-30 columns each
- **Result**: Reduced memory usage per query, faster response times

## Notes

- The ID is consistent across all 4 tables (same school has same ID in all tables)
- schools1 is the "primary" table containing the ID generator
- All helper functions automatically handle the joins
- No application code changes needed beyond API routes
