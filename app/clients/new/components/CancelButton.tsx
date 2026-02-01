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

import { useNewClientForm } from '../_context';

export function CancelButton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { resetFormData } = useNewClientForm();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleCancel = () => {
    resetFormData();
    router.replace('/(tabs)/clients');
  };

  return (
    <Dialog
      open={cancelDialogOpen}
      onOpenChange={setCancelDialogOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onPress={() => setCancelDialogOpen(true)}
        >
          <Typography
            variant="body1Medium"
            style={[styles.cancelButton, { color: colors.primaryForeground }]}
          >
            {t('clients.cancel')}
          </Typography>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('clients.cancelConfirmTitle')}</DialogTitle>
          <DialogDescription>
            {t('clients.cancelConfirmMessage')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              size="sm"
              onPress={() => setCancelDialogOpen(false)}
            >
              {t('clients.cancelKeepButton')}
            </Button>
          </DialogClose>
          <Button
            variant="error"
            size="sm"
            onPress={handleCancel}
          >
            {t('clients.cancelConfirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  cancelButton: {
    fontSize: 16,
    fontWeight: '500',
  },
});
