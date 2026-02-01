import React, { useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { useTranslation } from 'react-i18next';
import Carousel from 'react-native-reanimated-carousel';
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
import type { Client } from '@/lib/services/clientService';
import { getClientById, updateClient } from '@/lib/services/clientService';
import {
  type DocumentType,
  formatDocument,
} from '@/lib/services/documentService';
import { useEditClientStore } from '@/lib/stores/editClientStore';

import SummaryItem from './new/components/SummaryItem';

/** Format phone number for display using libphonenumber-js */
function formatPhoneDisplay(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  try {
    const parsed = parsePhoneNumberWithError(phone);
    if (parsed) {
      return parsed.formatInternational();
    }
  } catch {
    // If parsing fails, return original
  }
  return phone;
}

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { width: screenWidth } = useWindowDimensions();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isChecking } = useAuthGuard();
  const queryClient = useQueryClient();
  const {
    initFromClient,
    clear: clearEditStore,
    draft,
    clientId: editClientId,
  } = useEditClientStore();
  const isThisClientEdit = editClientId === id;
  const displayDraft = isEditing && isThisClientEdit ? draft : null;

  // Document carousel dimensions
  const docCardSize = screenWidth * 0.4; // 40% of screen width

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

  if (isChecking || isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !client) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={styles.errorContainer}>
          <Typography
            variant="body1"
            style={{ color: colors.text }}
          >
            {t('common.error') || 'Erro ao carregar cliente'}
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveEdit = async () => {
    if (!id || !isThisClientEdit) return;
    setIsSaving(true);
    try {
      // Remove internal display properties before sending
      const {
 _displayDocs, _guarantor, ...updateData 
} =
        draft as typeof draft & {
          _displayDocs?: unknown;
          _guarantor?: unknown;
        };
      await updateClient(id, updateData);
      await queryClient.invalidateQueries({ queryKey: ['client', id] });
      clearEditStore();
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    if (client) {
      initFromClient(client);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    clearEditStore();
    setIsEditing(false);
  };

  const goToEditScreen = (path: string) => {
    if (id) router.push(`${path}?clientId=${id}&edit=1` as any);
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

  const displayName = displayDraft?.name ?? client.name ?? client.meta?.name;
  const rawPhone = displayDraft?.phone ?? client.phone ?? client.meta?.phone;
  const displayPhone = formatPhoneDisplay(rawPhone);
  const displayProfileUrl =
    displayDraft?.avatar ??
    client.profilePictureUrl ??
    client.meta?.profilePictureUrl;
  const displayRating =
    displayDraft?.reliability ??
    client.rating ??
    (client.meta?.reliability != null
      ? Number(client.meta.reliability)
      : undefined);
  const observation = displayDraft?.observation ?? client.meta?.observation;

  // Use guarantor from draft if available, otherwise from client
  const draftWithGuarantor = displayDraft as typeof displayDraft & {
    _guarantor?: Client;
  };
  const guarantor = draftWithGuarantor?._guarantor ?? client.guarantor;

  // Get document URLs - in edit mode use _displayDocs, otherwise use client.documents
  const draftWithDocs = displayDraft as typeof displayDraft & {
    _displayDocs?: { uri: string }[];
  };
  const documentUrls = draftWithDocs?._displayDocs?.length
    ? draftWithDocs._displayDocs.map((d: { uri: string }) => d.uri)
    : (client?.documents ?? [])
        .map((d) =>
          typeof d === 'object' && d && 'downloadUrl' in d
            ? (d as { downloadUrl?: string }).downloadUrl
            : undefined
        )
        .filter((u): u is string => !!u);

  const displayEmail = displayDraft?.email ?? client.email;
  const rawDocument = displayDraft?.document ?? client.document;
  const displayDocumentType = displayDraft?.documentType ?? client.documentType;
  const addr = displayDraft?.address ?? client.address;
  const countryCode = (addr?.countryCode ?? 'BR') as 'BR' | 'US' | 'UK';
  const displayDocument = rawDocument
    ? formatDocument(
        rawDocument,
        countryCode,
        displayDocumentType as DocumentType | undefined
      )
    : undefined;
  const address = addr
    ? [
        addr.street,
        addr.number,
        addr.neighborhood,
        addr.city,
        addr.state,
        addr.postalCode,
        addr.complement,
      ]
        .filter(Boolean)
        .join(', ')
    : undefined;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <BackButton />

        {isEditing ? (
          <View style={styles.editButtonsRow}>
            <Button
              variant="outline"
              size="sm"
              onPress={handleCancelEdit}
              style={styles.editButton}
            >
              <Typography
                variant="body2Medium"
                color="primaryForeground"
              >
                {t('common.cancel')}
              </Typography>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onPress={handleSaveEdit}
              loading={isSaving}
              style={styles.editButton}
            >
              {t('common.save')}
            </Button>
          </View>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onPress={handleEdit}
            style={styles.editButton}
          >
            <Typography
              variant="body2Medium"
              color="primaryForeground"
            >
              {t('common.edit')}
            </Typography>
          </Button>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section - tap name to edit name, avatar to edit avatar when editing */}
        <Pressable
          style={styles.profileSection}
          onPress={
            isEditing ? () => goToEditScreen('/clients/new/name') : undefined
          }
          disabled={!isEditing}
        >
          <Pressable
            onPress={
              isEditing
                ? (e) => {
                    e?.stopPropagation?.();
                    goToEditScreen('/clients/new/avatar');
                  }
                : undefined
            }
            disabled={!isEditing}
            style={[
              styles.avatarPressable,
              isEditing && {
                ...styles.editableItem,
                backgroundColor: colors.muted,
                borderRadius: 100,
              },
            ]}
          >
            <Avatar
              image={displayProfileUrl}
              icon="user-filled"
              size={64}
              backgroundColor="muted"
              iconColor="icon"
            />
          </Pressable>
          <View style={styles.profileInfo}>
            <Typography
              variant="body1Bold"
              style={[
                styles.clientName,
                { color: colors.text },
                isEditing && {
                  ...styles.editableItem,
                  backgroundColor: colors.muted,
                },
              ]}
            >
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
        </Pressable>

        {!isEditing && (
          <View style={styles.actionButtonsRow}>
            <IconButton
              icon="calendar"
              label={t('clients.history') || 'Histórico'}
              onPress={handleHistory}
              backgroundColor="muted"
              shape="rounded"
              size="lg"
              labelStyle={{
 width: 90,
textAlign: 'center' 
}}
            />
            <IconButton
              icon="whatsapp"
              label={t('clients.chat') || 'Conversar'}
              onPress={handleChat}
              backgroundColor="muted"
              shape="rounded"
              size="lg"
              labelStyle={{
 width: 90,
textAlign: 'center' 
}}
            />
            <IconButton
              icon="map-pin"
              label={t('clients.viewOnMap') || 'Ver no mapa'}
              onPress={handleMap}
              backgroundColor="muted"
              shape="rounded"
              size="lg"
              labelStyle={{
 width: 90,
textAlign: 'center' 
}}
            />
          </View>
        )}

        {/* Details Section */}
        <View style={styles.detailsSection}>
          {/* WhatsApp */}
          {(displayPhone || isEditing) && (
            <SummaryItem
              icon="whatsapp"
              isEditing={isEditing}
              label={t('clients.whatsapp') || 'WhatsApp'}
              value={displayPhone ?? '—'}
              onPress={
                isEditing
                  ? () => goToEditScreen('/clients/new/whatsapp')
                  : undefined
              }
            />
          )}

          {/* Document (CPF/CNPJ) */}
          {(displayDocument || isEditing) && (
            <SummaryItem
              icon="id"
              isEditing={isEditing}
              label={
                displayDocumentType?.toUpperCase() || t('clients.document')
              }
              onPress={
                isEditing
                  ? () => goToEditScreen('/clients/new/document')
                  : undefined
              }
              value={displayDocument ?? '—'}
            />
          )}

          {/* Observation */}
          {(observation !== undefined && observation !== '') || isEditing ? (
            <SummaryItem
              icon="note"
              isEditing={isEditing}
              label={t('clients.observation') || 'Observação'}
              value={observation ?? '—'}
              onPress={
                isEditing
                  ? () => goToEditScreen('/clients/new/observation')
                  : undefined
              }
            />
          ) : null}

          {/* Reference */}
          {(guarantor != null || isEditing) && (
            <SummaryItem
              icon="user-share"
              isEditing={isEditing}
              label={t('clients.summaryGuarantor')}
              onPress={
                isEditing
                  ? () => goToEditScreen('/clients/new/guarantor')
                  : undefined
              }
              value={
                guarantor ? (
                  <View style={styles.guarantorRow}>
                    <Badge
                      icon="user-circle"
                      value={
                        <View style={styles.guarantorNameRow}>
                          <Typography
                            variant="body2SemiBold"
                            style={{ fontSize: 13 }}
                          >
                            {guarantor.name}
                          </Typography>
                          <Icon
                            name="star-filled"
                            color="primaryForeground"
                            size={16}
                            style={{
                              paddingLeft: 4,
                              borderLeftWidth: 2,
                              borderLeftColor: colors.border,
                            }}
                          />
                          <Typography
                            variant="body2Medium"
                            style={{ fontSize: 13 }}
                            color="text"
                          >
                            {guarantor.meta?.reliability || 0}
                          </Typography>
                        </View>
                      }
                      backgroundColor="muted"
                      foregroundColor="primaryForeground"
                      size="sm"
                    />
                  </View>
                ) : (
                  <Typography
                    variant="h6Medium"
                    color="text"
                  >
                    —
                  </Typography>
                )
              }
            />
          )}

          {isEditing && (
            <SummaryItem
              icon="star"
              label={t('clients.summaryReliability')}
              isEditing={isEditing}
              value={
                <Typography
                  variant="body1"
                  style={{ fontSize: 16 }}
                  color="text"
                >
                  {t('clients.reliabilityLevel', { level: displayRating })}
                </Typography>
              }
              onPress={
                isEditing
                  ? () => goToEditScreen('/clients/new/reliability')
                  : undefined
              }
            />
          )}

          {/* Document Images */}
          {(documentUrls.length > 0 || isEditing) && (
            <SummaryItem
              icon="photo"
              isEditing={isEditing}
              label={t('clients.documents')}
              onPress={
                isEditing
                  ? () => goToEditScreen('/clients/new/documents')
                  : undefined
              }
              value={
                documentUrls.length > 0 ? (
                  <View style={styles.carouselContainer}>
                    <Carousel
                      loop={false}
                      width={docCardSize}
                      height={docCardSize}
                      style={{ width: screenWidth - 48 }}
                      data={documentUrls}
                      scrollAnimationDuration={300}
                      renderItem={({ item: uri }: { item: string }) => (
                        <View style={styles.carouselItem}>
                          <ImageCardView
                            uri={uri}
                            style={{
                              width: docCardSize - 8,
                              height: docCardSize - 8,
                            }}
                          />
                        </View>
                      )}
                    />
                  </View>
                ) : (
                  <Typography
                    variant="h6Medium"
                    color="text"
                  >
                    —
                  </Typography>
                )
              }
            />
          )}

          {/* Email */}
          {(displayEmail || isEditing) && (
            <SummaryItem
              icon="mail"
              isEditing={isEditing}
              label={t('clients.email') || 'Endereço de e-mail'}
              onPress={
                isEditing
                  ? () => goToEditScreen('/clients/new/email')
                  : undefined
              }
              value={
                <View style={styles.emailRow}>
                  <Typography
                    variant="h6Medium"
                    color="text"
                  >
                    {displayEmail ?? '—'}
                  </Typography>
                  {!isEditing && displayEmail && (
                    <IconButton
                      variant="secondary"
                      icon="mail"
                      size="sm"
                      shape="rounded"
                      iconColor="primaryForeground"
                      onPress={handleEmailAction}
                    />
                  )}
                </View>
              }
            />
          )}

          {/* Address */}
          {(address || isEditing) && (
            <View
              style={[styles.detailItem, { borderBottomColor: colors.border }]}
            >
              <SummaryItem
                icon="map-pin"
                isEditing={isEditing}
                label={t('clients.address') || 'Endereço físico'}
                value={address ?? '—'}
                onPress={
                  isEditing
                    ? () => goToEditScreen('/clients/new/address')
                    : undefined
                }
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,},
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
  editButton: {minWidth: 80,},
  scrollView: {flex: 1,},
  scrollContent: {paddingBottom: 24,},
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
  avatarPressable: {alignSelf: 'flex-start',},
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
  actionButtonWrapper: {padding: 8,},
  editableItem: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 5,
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
  carouselContainer: {
    marginTop: 8,
    marginLeft: -24,
    width: '100%',
  },
  carouselItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
});
