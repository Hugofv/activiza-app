# shadcn/ui Setup for React Native

This project is configured with **shadcn/ui** for React Native using **NativeWind** (Tailwind CSS for React Native).

## Configuration Files

- ✅ `tailwind.config.js` - Tailwind configuration with shadcn/ui theme
- ✅ `babel.config.js` - Babel config with NativeWind plugin
- ✅ `metro.config.js` - Metro bundler config with NativeWind
- ✅ `global.css` - Global CSS with Tailwind directives and CSS variables
- ✅ `components.json` - shadcn/ui configuration
- ✅ `lib/utils.ts` - Utility functions (cn helper)
- ✅ `nativewind-env.d.ts` - TypeScript definitions for NativeWind

## Usage

### Using Tailwind Classes

You can now use Tailwind classes directly in your components:

```tsx
import { View, Text } from 'react-native';

export function MyComponent() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-foreground text-2xl font-bold">
        Hello shadcn/ui!
      </Text>
    </View>
  );
}
```

### Using shadcn/ui Components

Components are located in `components/ui/`. Example:

```tsx
import { Button } from '@/components/ui/Button';

export function MyScreen() {
  return (
    <View className="p-4">
      <Button variant="default" size="default">
        Click me
      </Button>
    </View>
  );
}
```

### Adding New shadcn/ui Components

You can add new components using the shadcn CLI or manually:

1. Visit [shadcn/ui](https://ui.shadcn.com/docs/components)
2. Copy the component code
3. Adapt it for React Native (replace HTML elements with React Native components)
4. Place it in `components/ui/`

## Available Theme Colors

The theme uses CSS variables defined in `global.css`:

- `background` / `foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `destructive` / `destructive-foreground`
- `card` / `card-foreground`
- `popover` / `popover-foreground`
- `border`, `input`, `ring`

## Utility Functions

### `cn()` - Class Name Merger

Use the `cn()` utility to merge class names:

```tsx
import { cn } from '@/lib/utils';

<View className={cn('flex-1', isActive && 'bg-primary')} />
```

## Notes

- Make sure to import `global.css` in your root layout (already done in `app/_layout.tsx`)
- React Native components use `className` prop instead of `class`
- Some web-specific Tailwind utilities may not work in React Native
- Use React Native components (View, Text, Pressable, etc.) instead of HTML elements

