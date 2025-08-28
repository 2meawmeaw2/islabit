# SalatHabitsDisplay Component

A modern, clean component for displaying salat-based habits with improved UX and visual design.

## Features

- **Clean Design**: Modern card-based layout with better spacing and typography
- **Progress Visualization**: Circular progress indicator showing completion percentage
- **Priority System**: Visual priority indicators (high, medium, low) with color coding
- **Interactive Elements**: Smooth animations and touch feedback
- **Arabic RTL Support**: Proper right-to-left layout for Arabic text
- **Streak Tracking**: Visual fire icons showing habit streaks
- **Empty State**: Helpful empty state with add habit button

## Props

```typescript
type Props = {
  salatName: string; // Name of the prayer time (e.g., "الفجر")
  salatTime?: string; // Optional time display (e.g., "05:00")
  habits: SalatHabit[]; // Array of habits for this prayer time
  onToggleHabit: (id: string, completed: boolean) => void;
  onHabitPress: (id: string) => void;
  onAddHabit?: () => void; // Optional callback for adding new habits
};
```

## Habit Structure

```typescript
type SalatHabit = {
  id: string;
  title: string;
  description?: string;
  streak: number;
  completed: boolean;
  priority?: "low" | "medium" | "high";
};
```

## Usage Example

```tsx
import { SalatHabitsDisplay } from "@/components/time/SalatHabitsDisplay";

<SalatHabitsDisplay
  salatName="الفجر"
  salatTime="05:00"
  habits={[
    {
      id: "1",
      title: "أذكار الصباح",
      description: "قراءة أذكار الصباح",
      streak: 5,
      completed: true,
      priority: "high",
    },
  ]}
  onToggleHabit={(id, completed) => {
    // Handle habit toggle
  }}
  onHabitPress={(id) => {
    // Navigate to habit details
  }}
  onAddHabit={() => {
    // Add new habit
  }}
/>;
```

## Improvements Over Previous Component

1. **Better Visual Hierarchy**: Clearer separation between prayer times and habits
2. **Progress Visualization**: Circular progress indicator instead of just text
3. **Priority System**: Visual priority indicators for better habit management
4. **Improved Spacing**: Better use of white space and padding
5. **Enhanced Animations**: Smoother, more polished animations
6. **Better Empty States**: More helpful empty state with action buttons
7. **Cleaner Code**: Better organized, more maintainable component structure

## Styling

The component uses NativeWind classes and follows the existing design system:

- `bg-bg`, `bg-fore` for backgrounds
- `text-text-brand`, `text-text-primary` for text colors
- `border-border-primary` for borders
- RTL-friendly flexbox layouts with `flex-row-reverse`
