# Supabase Integration for Islamic Habit Tracking

This document explains the comprehensive Supabase integration for the Islamic habit tracking app, including database schema, API functions, sync mechanisms, and usage examples.

## 🏗️ Architecture Overview

The integration follows a **separation of concerns** approach:

### **Data Sources**

- **User habits**: Stored in Supabase and synced to local storage
- **Bundle habits**: When enrolled, become user habits in Supabase

### **Storage Strategy**

- **Supabase cloud storage**: Primary storage for user habits
- **Local AsyncStorage**: Cache of user habits for offline access
- **React Query**: State management and caching
- **Automatic sync**: Bidirectional sync between cloud and local

## 📊 Database Schema

### Habits Table

```sql
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  quote TEXT,
  description TEXT,
  streak INTEGER DEFAULT 0,
  completed JSONB DEFAULT '[]'::jsonb,
  related_days INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  related_salat TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'عادي',
  priority_color TEXT DEFAULT '#22C55E',
  category JSONB DEFAULT '{"text": "عام", "hexColor": "#8B5CF6"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Features:

- **Row Level Security (RLS)** - Users can only access their own habits
- **Islamic Integration** - Prayer times and spiritual categories
- **Performance Indexes** - Optimized for prayer and day-based queries
- **Automatic Timestamps** - Created and updated timestamps

## 🚀 Setup Instructions

### 1. Apply Database Migration

Run the SQL migration in your Supabase dashboard:

```sql
-- Copy the contents of schema/001_create_habits_table.sql
-- and run it in your Supabase SQL editor
```

### 2. Enable Authentication

Ensure Supabase Auth is configured in your app:

```typescript
// Already configured in utils/supabase.ts
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createWebStorage(),
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

### 3. Import the New Modules

```typescript
// Import habits queries
import {
  useHabits,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useToggleHabitCompletion,
} from "@/lib/queries";

// Import display hooks for user habits
import { useAllHabitsForDisplay, useUserHabitsOnly } from "@/lib/queries";

// Import sync functionality
import { useHabitsSync } from "@/lib/use-habits-sync";

// Import components
import { SyncStatus } from "@/components/SyncStatus";
import { HabitsDisplay } from "@/components/HabitsDisplay";
```

## 📱 Usage Examples

### 1. Displaying All User Habits

```typescript
import { HabitsDisplay } from "@/components/HabitsDisplay";

const MyComponent = () => {
  return (
    <HabitsDisplay
      onHabitPress={(habit) => {
        // Handle user habit interaction
        console.log('User habit:', habit.title);
      }}
    />
  );
};
```

### 2. Fetching Only User Habits

```typescript
import { useUserHabitsOnly } from "@/lib/queries";

const MyComponent = () => {
  const { data: userHabits, isLoading, error } = useUserHabitsOnly();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <View>
      {userHabits.map(habit => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </View>
  );
};
```

### 2. Creating a New Habit

```typescript
import { useCreateHabit } from "@/lib/queries";

const AddHabitForm = () => {
  const createHabit = useCreateHabit();

  const handleSubmit = async (habitData) => {
    try {
      await createHabit.mutateAsync({
        title: "صلاة الفجر في وقتها",
        quote: "الفجر بداية البركة",
        relatedSalat: ["fajr"],
        relatedDays: [0, 1, 2, 3, 4, 5, 6],
        category: { text: "روحاني", hexColor: "#8B5CF6" },
        priority: "عالي",
        priorityColor: "#22C55E"
      });

      // Success! Habit is automatically synced
    } catch (error) {
      console.error("Error creating habit:", error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Form fields */}
    </Form>
  );
};
```

### 3. Toggling Habit Completion

```typescript
import { useToggleHabitCompletion } from "@/lib/queries";

const HabitCard = ({ habit }) => {
  const toggleCompletion = useToggleHabitCompletion();

  const handleToggle = async (date: string, prayer: string) => {
    const isCompleted = habit.completed.includes(`${date}_${prayer}`);

    await toggleCompletion.mutateAsync({
      id: habit.id,
      date,
      prayer,
      completed: !isCompleted
    });
  };

  return (
    <Pressable onPress={() => handleToggle(today, "fajr")}>
      <Text>{habit.title}</Text>
    </Pressable>
  );
};
```

### 4. Displaying Sync Status

```typescript
import { SyncStatus } from "@/components/SyncStatus";

const SettingsScreen = () => {
  return (
    <View>
      <SyncStatus showDetails={true} />

      {/* Or use compact version */}
      <SyncStatusCompact />

      {/* Or badge for notifications */}
      <View>
        <Icon name="sync" />
        <SyncStatusBadge />
      </View>
    </View>
  );
};
```

### 5. Manual Sync Control

```typescript
import { useHabitsSync } from "@/lib/use-habits-sync";

const SyncControl = () => {
  const {
    triggerSync,
    isSyncing,
    hasPendingChanges,
    getFormattedLastSyncTime
  } = useHabitsSync();

  return (
    <View>
      <Text>آخر مزامنة: {getFormattedLastSyncTime()}</Text>

      {hasPendingChanges && (
        <Text>تغييرات في الانتظار: {hasPendingChanges}</Text>
      )}

      <Pressable
        onPress={triggerSync}
        disabled={isSyncing}
      >
        <Text>{isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}</Text>
      </Pressable>
    </View>
  );
};
```

## 🔄 Sync Mechanism

### Automatic Sync

The system automatically syncs:

- **On app start** - If there are pending changes
- **Every 5 minutes** - Background sync check
- **After habit changes** - With 2-second delay for batching

### Manual Sync

```typescript
const { triggerSync } = useHabitsSync();

// Trigger immediate sync
await triggerSync();
```

### Sync Status

```typescript
const { getSyncSummary } = useHabitsSync();

const summary = getSyncSummary();
// Returns: { status: 'synced'|'syncing'|'pending'|'error', message: string, color: string }
```

## 🛡️ Security Features

### Row Level Security (RLS)

- Users can only access their own habits
- Automatic user ID filtering
- Secure by default

### Authentication Required

- All API calls require authentication
- Graceful fallback to local storage when offline
- Automatic retry on authentication errors

## 📊 Performance Optimizations

### Caching Strategy

- **React Query** for client-side caching
- **2-minute stale time** for habits (frequent updates)
- **5-minute garbage collection** time
- **Optimistic updates** for better UX

### Database Indexes

- `user_id` index for fast user queries
- `related_salat` GIN index for prayer-based filtering
- `related_days` GIN index for day-based filtering

## 🔧 Migration from Local Storage

### Automatic Migration

The system automatically migrates existing local habits:

1. **Detects local habits** (IDs starting with 'bundle\_' or timestamps)
2. **Uploads to Supabase** with new UUIDs
3. **Updates local storage** with new IDs
4. **Maintains data integrity** throughout the process

### Manual Migration

```typescript
import { useSyncHabitsWithSupabase } from "@/lib/queries";

const MigrationComponent = () => {
  const syncHabits = useSyncHabitsWithSupabase();

  const handleMigration = async () => {
    const localHabits = await getLocalHabits();
    await syncHabits.mutateAsync(localHabits);
  };

  return (
    <Pressable onPress={handleMigration}>
      <Text>مزامنة العادات المحلية</Text>
    </Pressable>
  );
};
```

## 🐛 Error Handling

### Network Errors

- Automatic retry with exponential backoff
- Graceful fallback to local storage
- User-friendly error messages

### Authentication Errors

- Automatic token refresh
- Redirect to login if needed
- Preserve local data

### Sync Conflicts

- Last-write-wins strategy
- Conflict resolution in sync service
- Detailed error reporting

## 📱 Offline Support

### Local-First Architecture

- All operations work offline
- Changes queued for sync when online
- Automatic sync when connection restored

### Data Persistence

- AsyncStorage for local data
- React Query for caching
- Automatic conflict resolution

## 🎯 Islamic Features

### Prayer-Based Tracking

```typescript
// Get habits for specific prayer
const { data: fajrHabits } = useHabitsForPrayer("fajr");
const { data: dhuhrHabits } = useHabitsForPrayer("dhuhr");
```

### Day-Based Filtering

```typescript
// Get habits for specific day (0=Sunday, 6=Saturday)
const { data: mondayHabits } = useHabitsForDay(1);
```

### Spiritual Categories

```typescript
const islamicCategories = [
  { text: "روحاني", hexColor: "#8B5CF6" },
  { text: "اجتماعي", hexColor: "#06B6D4" },
  { text: "صحي", hexColor: "#10B981" },
  { text: "تعليمي", hexColor: "#F59E0B" },
];
```

## 🚀 Best Practices

### 1. Use the Hooks

Always use the provided React Query hooks instead of direct API calls:

```typescript
// ✅ Good
const { data: habits } = useHabitsAsLocal();

// ❌ Avoid
const habits = await fetchHabits();
```

### 2. Handle Loading States

```typescript
const { data: habits, isLoading, error } = useHabitsAsLocal();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### 3. Optimistic Updates

The system provides optimistic updates for better UX:

```typescript
const toggleCompletion = useToggleHabitCompletion();

// UI updates immediately, syncs in background
await toggleCompletion.mutateAsync({ id, date, prayer, completed: true });
```

### 4. Sync Status Awareness

Show sync status to users:

```typescript
const { getSyncSummary } = useHabitsSync();
const summary = getSyncSummary();

// Display appropriate UI based on sync status
```

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check if user is logged in
   - Verify Supabase configuration
   - Check token expiration

2. **Sync Failures**
   - Check network connectivity
   - Verify RLS policies
   - Check for data conflicts

3. **Performance Issues**
   - Monitor query performance
   - Check index usage
   - Optimize React Query settings

### Debug Tools

```typescript
// Enable debug logging
import { SyncStatus } from "@/components/SyncStatus";

// Show detailed sync status
<SyncStatus showDetails={true} />
```

## 📈 Monitoring

### Sync Metrics

- Pending changes count
- Last sync time
- Sync success/failure rates
- Network connectivity status

### Performance Metrics

- Query response times
- Cache hit rates
- Offline usage patterns
- User engagement with sync features

---

This integration provides a robust, scalable foundation for Islamic habit tracking with full offline support, automatic sync, and Islamic-specific features. The system is designed to be user-friendly while maintaining data integrity and performance.
