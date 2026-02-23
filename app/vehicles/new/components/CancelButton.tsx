import { useState } from 'react';

import { StyleSheet } from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useNewVehicleForm } from '../_context';

export function CancelButton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { resetFormData } = useNewVehicleForm();
  const [open, setOpen] = useState(false);

  const handleCancel = () => {
    resetFormData();
    router.replace('/vehicles' as any);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onPress={() => setOpen(true)}
        >
          <Typography
            variant="body1Medium"
            style={[styles.cancelText, { color: colors.primaryForeground }]}
          >
            {t('common.cancel')}
          </Typography>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('operations.cancelVehicleTitle')}</DialogTitle>
          <DialogDescription>
            {t('operations.cancelVehicleMessage')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              size="sm"
              onPress={() => setOpen(false)}
            >
              {t('operations.keepEditing')}
            </Button>
          </DialogClose>
          <Button
            variant="error"
            size="sm"
            onPress={handleCancel}
          >
            {t('common.discard')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
