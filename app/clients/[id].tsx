import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { getClientById, type Client } from '@/lib/services/clientService';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface DetailRowProps {
  icon: string;
  label: string;
  value?: string | React.ReactNode;
  onActionPress?: () => void;
  actionIcon?: string;
}

function DetailRow({ icon, label, value, onActionPress, actionIcon }: DetailRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!value) return null;

  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <View style={styles.detailRowLeft}>
        <Icon name={icon} size={24} color={colors.icon} />
        <View style={styles.detailRowContent}>
          <Typography variant="body2Medium" style={[styles.detailLabel, { color: colors.text }]}>
            {label}
          </Typography>
          {typeof value === 'string' ? (
            <Typography variant="body1" style={[styles.detailValue, { color: colors.text }]}>
              {value}
            </Typography>
          ) : (
            value
          )}
        </View>
      </View>
      {onActionPress && actionIcon && (
        <TouchableOpacity onPress={onActionPress} style={styles.actionButton}>
          <Icon name={actionIcon} size={20} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress?: () => void;
}

function ActionButton({ icon, label, onPress }: ActionButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity style={styles.actionButtonContainer} onPress={onPress}>
      <View style={[styles.actionButtonCircle, { backgroundColor: colors.primaryWhitenOpacity }]}>
        <Icon name={icon} size={24} color={colors.primaryForeground} />
      </View>
      <Typography variant="caption" style={[styles.actionButtonLabel, { color: colors.primaryForeground }]}>
        {label}
      </Typography>
    </TouchableOpacity>
  );
}

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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
            <Typography variant="h3" style={[styles.clientName, { color: colors.text }]}>
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
          <ActionButton icon="calendar" label={t('clients.history') || 'Histórico'} onPress={handleHistory} />
          <ActionButton icon="whatsapp" label={t('clients.chat') || 'Conversar'} onPress={handleChat} />
          <ActionButton icon="map-pin" label={t('clients.viewOnMap') || 'Ver no mapa'} onPress={handleMap} />
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          {/* WhatsApp */}
          {client.phone && (
            <DetailRow
              icon="whatsapp"
              label={t('clients.whatsapp') || 'WhatsApp'}
              value={client.phone}
            />
          )}

          {/* Observation */}
          {observation && (
            <DetailRow
              icon="note"
              label={t('clients.observation') || 'Observação'}
              value={observation}
            />
          )}

          {/* Reference */}
          {reference && (
            <DetailRow
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
          )}

          {/* Documents */}
          {documents && documents.length > 0 && (
            <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <View style={styles.detailRowLeft}>
                <Icon name="file-text" size={24} color={colors.icon} />
                <View style={styles.detailRowContent}>
                  <Typography variant="body2Medium" style={[styles.detailLabel, { color: colors.text }]}>
                    {t('clients.documents') || 'Documentos'}
                  </Typography>
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
                </View>
              </View>
            </View>
          )}

          {/* Email */}
          {client.email && (
            <DetailRow
              icon="mail"
              label={t('clients.email') || 'Endereço de e-mail'}
              value={client.email}
              onActionPress={handleEmailAction}
              actionIcon="mail"
            />
          )}

          {/* Address */}
          {address && (
            <DetailRow
              icon="map-pin"
              label={t('clients.address') || 'Endereço físico'}
              value={address}
            />
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
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  actionButtonContainer: {
    alignItems: 'center',
    gap: 8,
  },
  actionButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsSection: {
    paddingHorizontal: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  detailRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailRowContent: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
  },
  actionButton: {
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
