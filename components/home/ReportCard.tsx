import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ReportCardProps {
  title: string;
  subtitle?: string;
  description?: string;
}

export function ReportCard({ title, subtitle, description }: ReportCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.reportCard, { backgroundColor: colors.background }]}>
      <View style={styles.titleContainer}>

        <Typography variant="h4" style={{ color: '#064e3b', marginBottom: 4 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" style={{ color: colors.placeholder, marginBottom: 2 }}>
            {subtitle}
          </Typography>
        )}
      </View>
      {description && (
        <Typography variant="caption" style={{ color: colors.text }}>
          {description}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  reportCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    height: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});
