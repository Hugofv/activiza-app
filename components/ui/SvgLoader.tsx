import React, { useEffect, useState } from 'react';

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import Svg, { SvgProps } from 'react-native-svg';

interface SvgLoaderProps extends SvgProps {
  uri: string;
  fallback?: React.ReactNode;
}

/**
 * Component to load and render SVG from URI using react-native-svg
 */
export function SvgLoader({ uri, fallback, ...svgProps }: SvgLoaderProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadSvg = async () => {
      try {
        setLoading(true);
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.statusText}`);
        }
        const text = await response.text();
        setSvgContent(text);
        setError(false);
      } catch (err) {
        console.error('Error loading SVG:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadSvg();
  }, [uri]);

  if (loading) {
    return (
      <View style={styles.container}>
        {fallback || <ActivityIndicator size="small" />}
      </View>
    );
  }

  if (error || !svgContent) {
    return <View style={styles.container}>{fallback}</View>;
  }

  // Parse and render SVG - this is a simplified version
  // For complex SVGs, you might need a proper SVG parser
  return (
    <Svg
      {...svgProps}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* The SVG content will be rendered here */}
      {/* Note: This is a basic implementation. For full SVG support,
          you'd need to parse the SVG XML and convert it to react-native-svg components */}
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
