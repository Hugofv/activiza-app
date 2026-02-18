import * as React from 'react';

import { Text, type TextProps, type ViewStyle } from 'react-native';

import { type VariantProps, cva } from 'class-variance-authority';

import { Skeleton } from '@/components/ui/Skeleton';
import { Colors, type ThemeColorKey } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-h1 font-bold tracking-tight leading-h1',
      h2: 'text-h2 font-bold tracking-tight leading-h2',
      h2Medium: 'text-h2Medium font-medium tracking-tight leading-h2Medium',
      h3: 'text-h3 font-semibold tracking-tight leading-h3',
      h3Medium: 'text-h3Medium font-medium tracking-tight leading-h3Medium',
      h4: 'text-h4 font-semibold tracking-tight leading-h4',
      h4Medium: 'text-h4Medium font-medium tracking-tight leading-h4Medium',
      h5: 'text-h5 font-semibold leading-h5',
      h5Medium: 'text-h5Medium font-medium leading-h5Medium',
      h6: 'text-h6 font-semibold leading-h6',
      h6Medium: 'text-h6Medium font-medium leading-h6Medium',
      subtitle: 'text-h4 font-semibold leading-h4',
      body1: 'text-base leading-6',
      body1Medium: 'text-base leading-6 font-medium',
      body1SemiBold: 'text-base leading-6 font-semibold',
      body1Bold: 'text-base leading-6 font-bold',
      body2: 'text-sm leading-5',
      body2Medium: 'text-sm leading-5 font-medium',
      body2SemiBold: 'text-sm leading-5 font-semibold',
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
  defaultVariants: { variant: 'p' },
});

export type TypographyVariant = VariantProps<
  typeof typographyVariants
>['variant'];

export interface TypographyProps
  extends TextProps, VariantProps<typeof typographyVariants> {
  children?: React.ReactNode;
  color?: ThemeColorKey;
  loading?: boolean;
  skeletonWidth?: number | string;
}

const Typography = React.forwardRef<
  React.ElementRef<typeof Text>,
  TypographyProps
>(({ className, variant, style, children, color, loading, skeletonWidth, ...props }, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Map variants to font families
  const fontFamilyMap: Record<string, string> = {
    h1: 'Inter_700Bold',
    h2: 'Inter_700Bold',
    h2Medium: 'Inter_500Medium',
    h3: 'Inter_600SemiBold',
    h3Medium: 'Inter_500Medium',
    h4: 'Inter_600SemiBold',
    h4Medium: 'Inter_500Medium',
    h5: 'Inter_600SemiBold',
    h5Medium: 'Inter_500Medium',
    h6: 'Inter_600SemiBold',
    h6Medium: 'Inter_500Medium',
    subtitle: 'Inter_600SemiBold',
    body1: 'Inter_400Regular',
    body1Medium: 'Inter_500Medium',
    body1SemiBold: 'Inter_600SemiBold',
    body1Bold: 'Inter_700Bold',
    body2: 'Inter_400Regular',
    body2Medium: 'Inter_500Medium',
    body2SemiBold: 'Inter_600SemiBold',
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
    h2Medium: 30,
    h3Medium: 24,
    h4Medium: 20,
    h5Medium: 18,
    h6Medium: 16,
    subtitle: 20,
    body1: 18,
    body1Medium: 18,
    body1SemiBold: 18,
    body1Bold: 18,
    body2: 16,
    body2Medium: 16,
    body2SemiBold: 16,
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
    h2Medium: 36,
    h3Medium: 32,
    h4Medium: 28,
    h5Medium: 26,
    h6Medium: 24,
    subtitle: 28,
    body1: 24,
    body2: 20,
    body2Medium: 20,
    body2SemiBold: 20,
    body1Bold: 24,
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

  // Get text color based on color prop, variant, and theme
  const getTextColor = () => {
    // If color prop is provided, use it (highest priority)
    if (color) {
      return colors[color];
    }

    // Otherwise, use variant-based defaults
    switch (variant) {
      case 'caption':
      case 'muted':
        return colors.icon; // Muted color for helper text
      case 'link':
        return colors.primary; // Primary green for links
      default:
        return colors.primaryForeground; // Default text color (theme-aware)
    }
  };

  if (loading) {
    const h = fontSize ?? 16;
    return (
      <Skeleton
        width={skeletonWidth ?? '60%'}
        height={h}
        borderRadius={h / 2}
        style={style as ViewStyle}
      />
    );
  }

  return (
    <Text
      ref={ref}
      className={cn(
        typographyVariants({
          variant,
          className,
        })
      )}
      style={[
        {
          color: getTextColor(),
          fontFamily,
          fontSize,
          lineHeight,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
});
Typography.displayName = 'Typography';

export { Typography, typographyVariants };
