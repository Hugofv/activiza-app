import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { BackButton } from '@/components/ui/BackButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ImageCardView } from '@/components/ui/ImageCardView';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { getClientById } from '@/lib/services/clientService';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import SummaryItem from './new/components/SummaryItem';



export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [isEditing, setIsEditing] = useState(false);
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isChecking } = useAuthGuard();

  const {
    data: client,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientById(id!),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!id && isAuthenticated,
  });
  console.log('Client:', client);

  if (isChecking || isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !client) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Typography variant="body1" style={{ color: colors.text }}>
            {t('common.error') || 'Erro ao carregar cliente'}
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleHistory = () => {
    // TODO: Navigate to history screen
    console.log('View history');
  };

  const handleChat = () => {
    // TODO: Open chat
    console.log('Open chat');
  };

  const handleMap = () => {
    // TODO: Open map
    console.log('View on map');
  };

  const handleEmailAction = () => {
    // TODO: Open email client
    console.log('Send email');
  };

  const displayName = client.name ?? client.meta?.name;
  const displayPhone = client.phone ?? client.meta?.phone;
  const displayProfileUrl = client.profilePictureUrl ?? client.meta?.profilePictureUrl;
  const displayRating = client.rating ?? (client.meta?.reliability != null ? Number(client.meta.reliability) : undefined);
  const observation = client.meta?.observation;
  const guarantor = client.guarantor;
  const documentUrls = (client?.documents ?? [])
    .map((d) => (typeof d === 'object' && d && 'downloadUrl' in d ? (d as { downloadUrl?: string }).downloadUrl : undefined))
    .filter((u): u is string => !!u);
  const addr = client.address;
  const address = addr
    ? [addr.street, addr.number, addr.neighborhood, addr.city, addr.state, addr.postalCode, addr.complement]
      .filter(Boolean)
      .join(', ')
    : undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <BackButton />

        {
          isEditing ? (
            <View style={styles.editButtonsRow}>
              <Button
                variant="outline"
                size="sm"
                onPress={handleEdit}
                style={styles.editButton}
              >
                <Typography variant="body2Medium" color="primaryForeground">
                  {t('common.cancel')}
                </Typography>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onPress={handleEdit}
                style={styles.editButton}
              >
                <Typography variant="body2Medium" color="primaryForeground">
                  {t('common.save')}
                </Typography>
              </Button>
            </View>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onPress={handleEdit}
              style={styles.editButton}
            >
              <Typography variant="body2Medium" color="primaryForeground">
                {t('common.edit')}
              </Typography>
            </Button>
          )
        }

      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Avatar
            image={displayProfileUrl}
            icon="user-filled"
            size={64}
            backgroundColor="muted"
            iconColor="icon"
          />
          <View style={styles.profileInfo}>
            <Typography variant="body1Bold" style={[styles.clientName, { color: colors.text }]}>
              {displayName}
            </Typography>
            {displayRating !== undefined && (
              <Badge
                icon="star"
                value={displayRating}
                backgroundColor="muted"
                foregroundColor="icon"
                size="sm"
              />
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <IconButton
            icon="calendar"
            label={t('clients.history') || 'Histórico'}
            onPress={handleHistory}
            backgroundColor="muted"
            shape="rounded"
            size="lg"
            labelStyle={{ width: 90, textAlign: 'center' }}
          />
          <IconButton
            icon="whatsapp"
            label={t('clients.chat') || 'Conversar'}
            onPress={handleChat}
            backgroundColor="muted"
            shape="rounded"
            size="lg"
            labelStyle={{ width: 90, textAlign: 'center' }}
          />
          <IconButton
            icon="map-pin"
            label={t('clients.viewOnMap') || 'Ver no mapa'}
            onPress={handleMap}
            backgroundColor="muted"
            shape="rounded"
            size="lg"
            labelStyle={{ width: 90, textAlign: 'center' }}
          />
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          {/* WhatsApp */}
          {displayPhone && (
            <SummaryItem
              icon="whatsapp"
              isEditing={isEditing}
              label={t('clients.whatsapp') || 'WhatsApp'}
              value={displayPhone}
            />
          )}

          {/* Observation */}
          {observation && (
            <SummaryItem
              icon="note"
              isEditing={isEditing}
              label={t('clients.observation') || 'Observação'}
              value={observation}
            />
          )}

          {/* Reference */}
          {guarantor != null ? (
            <SummaryItem icon='user-share' isEditing={isEditing} label={t('clients.summaryGuarantor')} value={
              <View style={styles.guarantorRow}>
                <Badge icon="user-circle" value={
                  <View style={styles.guarantorNameRow}>
                    <Typography variant='body2SemiBold' style={{ fontSize: 13 }}>
                      {guarantor.name}
                    </Typography>
                    <Icon name="star-filled" color="primaryForeground" size={16} style={{ paddingLeft: 4, borderLeftWidth: 2, borderLeftColor: colors.border }} />
                    <Typography variant="body2Medium" style={{ fontSize: 13 }} color="text">
                      {guarantor.meta?.reliability || 0}
                    </Typography>
                  </View>
                } backgroundColor="muted" foregroundColor="primaryForeground" size="sm" />
              </View>} />

          ) : null}

          {/* Document Images */}
          {documentUrls.length > 0 && (
            <SummaryItem icon='photo' isEditing={isEditing} label={t('clients.documents')} value={
              <View style={styles.documentImagesRow}>
                {documentUrls.map((uri, index) => (
                  <ImageCardView key={uri ?? index} uri={uri} />
                ))}
              </View>
            } />
          )}

          {/* Email */}
          {client.email && (
            <SummaryItem
              icon="mail"
              isEditing={isEditing}
              label={t('clients.email') || 'Endereço de e-mail'}
              value={
                <View style={styles.emailRow}>
                  <Typography variant="h6Medium" color='text'>
                    {client.email}
                  </Typography>
                  {!isEditing && <IconButton variant="secondary" icon="mail" size="sm" shape="rounded" iconColor="primaryForeground" onPress={handleEmailAction} />}
                </View>
              }
            />
          )}

          {/* Address */}
          {address && (
            <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <SummaryItem
                icon="map-pin"
                isEditing={isEditing}
                label={t('clients.address') || 'Endereço físico'}
                value={address}
              />
            </View>
          )}
        </View>
      </ScrollView >
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  editButton: {
    minWidth: 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 8,
  },
  clientName: {
    fontSize: 24,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 32,
    gap: 5,
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  detailsSection: {
    paddingHorizontal: 24,
    gap: 16,
  },
  detailItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '95%',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButtonWrapper: {
    padding: 8,
  },
  guarantorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guarantorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  documentImagesRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  documentThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
});
