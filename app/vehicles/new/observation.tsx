import { useState } from 'react';

import { StyleSheet, TextInput, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { buildVehicleTitle, createVehicle } from '@/lib/services/vehicleService';
import { useEditVehicleStore } from '@/lib/stores/editVehicleStore';

import { useNewVehicleForm } from './_context';

export default function VehicleObservationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const keyboardHeight = useKeyboardHeight();
  const queryClient = useQueryClient();
  const searchParams = useLocalSearchParams<{ vehicleId?: string; edit?: string }>();
  const isEditMode = !!searchParams.vehicleId && searchParams.edit === '1';
  const { draft, updateDraft } = useEditVehicleStore();
  const { formData, updateFormData, resetFormData } = useNewVehicleForm();
  const [observation, setObservation] = useState(
    isEditMode ? (draft.observation ?? '') : formData.observation
  );

  const mutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      resetFormData();
      router.replace('/vehicles' as any);
    },
  });

  const handleFinish = () => {
    if (isEditMode) {
      updateDraft({ observation: observation || undefined });
      router.back();
      return;
    }

    updateFormData({ observation });

    const parsedValue = formData.value
      ? parseFloat(formData.value.replace(/\D/g, '')) / 100
      : undefined;

    mutation.mutate({
      type: 'VEHICLE',
      title: buildVehicleTitle(formData.brand, formData.model, formData.year || undefined),
      meta: { subtype: formData.subtype },
      brand: formData.brand,
      model: formData.model,
      year: formData.year || undefined,
      plate: formData.plate.toUpperCase(),
      value: parsedValue,
      currency: formData.currency,
      mileage: formData.mileage || undefined,
      observation: observation || undefined,
      photos: formData.photos.length > 0 ? formData.photos : undefined,
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Typography
            variant="h3"
            color="text"
          >
            {t('operations.anyObservation')}
          </Typography>
          <Typography
            variant="body2"
            color="placeholder"
          >
            {t('operations.optional')}
          </Typography>
        </View>

        {/* Text Area */}
        <TextInput
          style={[
            styles.textArea,
            {
              color: colors.text,
              borderColor: colors.icon,
              backgroundColor: colors.background,
            },
          ]}
          placeholder={t('operations.writeSomething')}
          placeholderTextColor={colors.icon}
          value={observation}
          onChangeText={setObservation}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {/* Finish Button */}
      <View
        style={[
          styles.buttonContainer,
          keyboardHeight > 0 && { marginBottom: keyboardHeight },
        ]}
      >
        <Button
          variant="primary"
          size="full"
          onPress={handleFinish}
          disabled={!isEditMode && mutation.isPending}
          loading={!isEditMode && mutation.isPending}
        >
          {isEditMode ? t('common.save') : t('operations.finish')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
});
