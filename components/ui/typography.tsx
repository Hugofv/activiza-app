import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Text, type TextProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-h1 font-bold tracking-tight leading-h1',
      h2: 'text-h2 font-bold tracking-tight leading-h2',
      h3: 'text-h3 font-semibold tracking-tight leading-h3',
      h4: 'text-h4 font-semibold tracking-tight leading-h4',
      h5: 'text-h5 font-semibold leading-h5',
      h6: 'text-h6 font-semibold leading-h6',
      subtitle: 'text-h4 font-semibold leading-h4',
      body1: 'text-base leading-6',
      body2: 'text-sm leading-5',
      caption: 'text-sm text-muted-foreground leading-5',
      p: 'text-base leading-6',
      lead: 'text-lead leading-lead',
      large: 'text-large font-medium leading-large',
      small: 'text-sm font-medium leading-5',
      muted: 'text-sm text-muted-foreground leading-5',
      blockquote: 'text-base border-l-4 border-border pl-4 italic leading-6',
      list: 'text-base leading-6',
      code: 'text-sm relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono leading-5',
      link: 'text-base text-primary underline-offset-4 underline leading-6',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});

export interface TypographyProps
  extends TextProps,
    VariantProps<typeof typographyVariants> {
  children?: React.ReactNode;
}

const Typography = React.forwardRef<React.ElementRef<typeof Text>, TypographyProps>(
  ({ className, variant, style, children, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Map variants to font families
    const fontFamilyMap: Record<string, string> = {
      h1: 'Inter_700Bold',
      h2: 'Inter_700Bold',
      h3: 'Inter_600SemiBold',
      h4: 'Inter_600SemiBold',
      h5: 'Inter_600SemiBold',
      h6: 'Inter_600SemiBold',
      subtitle: 'Inter_600SemiBold',
      body1: 'Inter_400Regular',
      body2: 'Inter_400Regular',
      caption: 'Inter_400Regular',
      p: 'Inter_400Regular',
      lead: 'Inter_400Regular',
      large: 'Inter_500Medium',
      small: 'Inter_500Medium',
      muted: 'Inter_400Regular',
      blockquote: 'Inter_400Regular',
      list: 'Inter_400Regular',
      code: 'Inter_400Regular',
      link: 'Inter_400Regular',
    };

    // Map variants to font sizes (for explicit style prop)
    const fontSizeMap: Record<string, number> = {
      h1: 36,
      h2: 30,
      h3: 24,
      h4: 20,
      h5: 18,
      h6: 16,
      subtitle: 20,
      body1: 18,
      body2: 16,
      caption: 14,
      p: 18,
      lead: 20,
      large: 18,
    };

    // Map variants to line heights
    const lineHeightMap: Record<string, number> = {
      h1: 40,
      h2: 36,
      h3: 32,
      h4: 28,
      h5: 26,
      h6: 24,
      subtitle: 28,
      body1: 24,
      body2: 20,
      caption: 16,
      p: 24,
      lead: 28,
      large: 26,
      small: 20,
      muted: 20,
      blockquote: 24,
      list: 24,
      code: 20,
      link: 24,
    };

    const fontFamily = variant ? fontFamilyMap[variant] : 'Inter_400Regular';
    const fontSize = variant ? fontSizeMap[variant] : 16;
    const lineHeight = variant ? lineHeightMap[variant] : 24;

    // Get text color based on variant and theme
    const getTextColor = () => {
      switch (variant) {
        case 'caption':
        case 'muted':
          return colors.icon; // Muted color for helper text
        case 'link':
          return colors.primary; // Primary green for links
        default:
          return colors.text; // Default text color (theme-aware)
      }
    };

    return (
      <Text
        ref={ref}
        className={cn(typographyVariants({ variant, className }))}
        style={[
          { 
            color: getTextColor(), 
            fontFamily,
            fontSize,
            lineHeight,
          },
          style,
        ]}
        {...props}>
        {children}
      </Text>
    );
  }
);
Typography.displayName = 'Typography';

export { Typography, typographyVariants };

