import React from 'react';

import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, IconName } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ListItemIconProps {
  icon?: string;
  label: string;
  value: any;
  isEditing?: boolean;
  onPress?: () => void;
}

const ListItemIcon = ({
  icon,
  label,
  value,
  isEditing,
  onPress,
}: ListItemIconProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleEdit = () => {
    if (isEditing) {
      onPress?.();
    }
  };

  return (
    <Pressable
      style={[
        styles.container,
        isEditing && {
          ...styles.containerEditing,
          backgroundColor: colors.muted,
          borderColor: colors.placeholder,
        },
      ]}
      onPress={handleEdit}
    >
      {icon && (
        <Icon
          name={icon as IconName}
          size={25}
          color="icon"
        />
      )}
      <View>
        <Typography
          variant="body1Medium"
          color="placeholder"
        >
          {label}
        </Typography>
        <View style={styles.valueRow}>
          {typeof value === 'string' ? (
            <Typography
              variant="h6Medium"
              color="text"
            >
              {value}
            </Typography>
          ) : (
            value
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  containerEditing: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 5,
  },
  valueRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
});

export default ListItemIcon;
