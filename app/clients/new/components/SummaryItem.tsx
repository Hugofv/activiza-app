import { Icon, IconName } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface SummaryItemProps {
  icon?: string;
  label: string;
  value: any;
  isEditing?: boolean;
  onPress?: () => void;
}

const SummaryItem = ({ icon, label, value, isEditing, onPress }: SummaryItemProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleEdit = () => {
    if (isEditing) {
      onPress?.();
    }
  };

  return (
    <Pressable style={[styles.container, isEditing && { ...styles.containerEditing, backgroundColor: colors.muted, borderColor: colors.placeholder }]} onPress={handleEdit}>
      {icon && (
        <Icon name={icon as IconName} size={22} color="icon" />
      )}
      <View>
        <Typography variant="body1Medium" color='placeholder'>
          {label}
        </Typography>
        <View style={styles.valueRow}>
          {
            typeof value === 'string' ? (
              <Typography variant="h6Medium" color='text'>
                {value}
              </Typography>
            ) : (
              value
            )
          }
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  containerEditing: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default SummaryItem;
