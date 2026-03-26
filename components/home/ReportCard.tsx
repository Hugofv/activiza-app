import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ReportCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  loading?: boolean;
  onPress?: () => void;
}

export function ReportCard({ title, subtitle, description, loading, onPress }: ReportCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const cardStyle = [
    styles.reportCard,
    {
      borderColor: colors.border,
      borderWidth: 1,
      // Required for Android elevation — without it, shadow renders as a dark inset halo
      backgroundColor: colors.background,
    },
  ];

  const content = (
    <>
      <View style={styles.titleContainer}>
        <Typography
          variant="h4"
          color="primaryForeground"
          style={{ marginBottom: 4 }}
          loading={loading}
          skeletonWidth="70%"
        >
          {title}
        </Typography>
        {(subtitle || loading) && (
          <Typography
            variant="body2"
            color="placeholder"
            style={{ marginBottom: 2 }}
            loading={loading}
            skeletonWidth="50%"
          >
            {subtitle}
          </Typography>
        )}
      </View>
      {(description || loading) && (
        <Typography
          variant="caption"
          color="text"
          loading={loading}
          skeletonWidth="40%"
        >
          {description}
        </Typography>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={cardStyle}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  reportCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    height: 130,
    flexDirection: 'column',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        // Keep modest; iOS shadow props are not used on Android
        elevation: 3,
      },
      default: {},
    }),
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});
