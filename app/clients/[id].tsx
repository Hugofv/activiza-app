import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { BackButton } from '@/components/ui/BackButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
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
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isChecking } = useAuthGuard();

  const {
    data: client,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientById(id!),
    enabled: !!id && isAuthenticated,
  });

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
    // TODO: Navigate to edit screen
    console.log('Edit client:', client.id);
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

  // Mock data for fields not in Client interface yet
  const observation = 'Tem boa reputação'; // client.observation
  const reference = { name: 'Hugo', rating: 4 }; // client.reference
  const documents = [
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
  ]; // client.documents
  const address = 'Rua Marajó, 10\nParque Amazônia, Goiânia, GO\nAp 201 Torre A'; // client.address

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <BackButton />
        <Button
          variant="secondary"
          size="sm"
          onPress={handleEdit}
          style={styles.editButton}
        >
          <Typography variant="body2Medium" color="primaryForeground">
            {t('common.edit') || 'Editar'}
          </Typography>
        </Button>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Avatar
            image={client.avatar}
            icon="user-filled"
            size={64}
            backgroundColor="muted"
            iconColor="icon"
          />
          <View style={styles.profileInfo}>
            <Typography variant="body1Bold" style={[styles.clientName, { color: colors.text }]}>
              {client.name}
            </Typography>
            {client.rating !== undefined && (
              <Badge
                icon="star"
                value={client.rating}
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
            size="md"
            labelStyle={{width: 90, textAlign: 'center'}}
          />
          <IconButton
            icon="whatsapp"
            label={t('clients.chat') || 'Conversar'}
            onPress={handleChat}
            backgroundColor="muted"
            shape="rounded"
            size="md"
            labelStyle={{width: 90, textAlign: 'center'}}
          />
          <IconButton
            icon="map-pin"
            label={t('clients.viewOnMap') || 'Ver no mapa'}
            onPress={handleMap}
            backgroundColor="muted"
            shape="rounded"
            size="md"
            labelStyle={{width: 90, textAlign: 'center'}}
          />
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          {/* WhatsApp */}
          {client.phone && (
            <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <SummaryItem
                icon="whatsapp"
                label={t('clients.whatsapp') || 'WhatsApp'}
                value={client.phone}
              />
            </View>
          )}

          {/* Observation */}
          {observation && (
            <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <SummaryItem
                icon="note"
                label={t('clients.observation') || 'Observação'}
                value={observation}
              />
            </View>
          )}

          {/* Reference */}
          {reference && (
            <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <SummaryItem
                icon="user-share"
                label={t('clients.reference') || 'Referência'}
                value={
                  <View style={styles.referenceValue}>
                    <Typography variant="body1" style={{ color: colors.text }}>
                      @ {reference.name}
                    </Typography>
                    <Badge
                      icon="star"
                      value={reference.rating}
                      backgroundColor="muted"
                      foregroundColor="icon"
                      size="sm"
                    />
                  </View>
                }
              />
            </View>
          )}

          {/* Documents */}
          {documents && documents.length > 0 && (
            <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <SummaryItem
                icon="file-text"
                label={t('clients.documents') || 'Documentos'}
                value={
                  <View style={styles.documentsRow}>
                    {documents.map((doc, index) => (
                      <TouchableOpacity key={index} style={styles.documentThumbnail}>
                        <ExpoImage
                          source={{ uri: doc }}
                          style={styles.documentImage}
                          contentFit="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                }
              />
            </View>
          )}

          {/* Email */}
          {client.email && (
            <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <View style={styles.emailRow}>
                <SummaryItem
                  icon="mail"
                  label={t('clients.email') || 'Endereço de e-mail'}
                  value={client.email}
                />
                <TouchableOpacity onPress={handleEmailAction} style={styles.actionButtonWrapper}>
                  <Icon name="mail" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Address */}
          {address && (
            <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <SummaryItem
                icon="map-pin"
                label={t('clients.address') || 'Endereço físico'}
                value={address}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  detailsSection: {
    paddingHorizontal: 24,
  },
  detailItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButtonWrapper: {
    padding: 8,
  },
  referenceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
