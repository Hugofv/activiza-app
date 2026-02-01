import * as React from 'react';

import { View, type ViewProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';

export interface ProgressProps extends ViewProps {
  value?: number; // 0-100
  className?: string;
}

const Progress = React.forwardRef<React.ElementRef<typeof View>, ProgressProps>(
  ({
 value = 0, className, style, ...props 
}, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Clamp value between 0 and 100
    const clampedValue = Math.min(Math.max(value, 0), 100);

    return (
      <View
        ref={ref}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        style={[
          {
            height: 8,
            borderRadius: 99,
            backgroundColor: colors.muted,
            overflow: 'hidden',
          },
          style,
        ]}
        {...props}
      >
        <View
          style={{
            height: '100%',
            width: `${clampedValue}%`,
            backgroundColor: colors.primary,
            borderRadius: 99,
          }}
        />
      </View>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
