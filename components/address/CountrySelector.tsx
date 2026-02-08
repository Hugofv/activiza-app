import React, { useState } from 'react';

import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { BackButton } from '@/components/ui/BackButton';
import { Icon } from '@/components/ui/Icon';
import { Progress } from '@/components/ui/Progress';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CountryCode } from '@/lib/services/postalCodeService';

const COUNTRIES: {
  code: CountryCode;
  name: string;
  nameEn: string;
  flag: string;
}[] = [
  {
    code: 'BR',
    name: 'Brasil',
    nameEn: 'Brazil',
    flag: '🇧🇷',
  },
  {
    code: 'UK',
    name: 'Reino Unido',
    nameEn: 'United Kingdom',
    flag: '🇬🇧',
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    nameEn: 'United States',
    flag: '🇺🇸',
  },
];

export interface CountrySelectorProps {
  initialValue?: CountryCode | null;
  onSelect: (country: CountryCode) => void;
  onBack?: () => void;
  progressValue?: number;
  title?: string;
  showProgress?: boolean;
  showBackButton?: boolean;
  customHeader?: React.ReactNode; // Custom header to replace the default one
}

/**
 * Reusable country selector component
 */
export const CountrySelector: React.FC<CountrySelectorProps> = ({
  initialValue = null,
  onSelect,
  onBack,
  progressValue = 0,
  title,
  showProgress = true,
  showBackButton = true,
  customHeader,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, i18n } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(
    initialValue
  );

  const getCountryName = (country: (typeof COUNTRIES)[0]) =>
    i18n.language.startsWith('pt') ? country.name : country.nameEn;

  const handleSelect = (countryCode: CountryCode) => {
    setSelectedCountry(countryCode);
    onSelect(countryCode);
  };

  return (
    <View style={styles.container}>
      {showProgress && (
        <View style={styles.progressContainer}>
          <Progress value={progressValue} />
        </View>
      )}

      {customHeader || (showBackButton && <BackButton onPress={onBack} />)}

      <Typography
        variant="h4"
        style={styles.title}
      >
        {title || t('onboarding.selectCountry')}
      </Typography>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.countryList}>
          {COUNTRIES.map((country) => {
            const isSelected = selectedCountry === country.code;
            return (
              <TouchableOpacity
                key={country.code}
                style={[
                  styles.countryItem,
                  {
                    backgroundColor: isSelected
                      ? colorScheme === 'dark'
                        ? '#1a2a24'
                        : '#effad1'
                      : 'transparent',
                    borderColor: isSelected ? colors.primary : colors.icon,
                  },
                ]}
                onPress={() => handleSelect(country.code)}
                activeOpacity={0.7}
              >
                <View style={styles.countryContent}>
                  <Typography style={styles.flag}>{country.flag}</Typography>
                  <Typography
                    variant="body1"
                    style={[
                      styles.countryName,
                      {
                        color: isSelected ? colors.primary : colors.text,
                        fontWeight: isSelected ? '600' : '400',
                      },
                    ]}
                  >
                    {getCountryName(country)}
                  </Typography>
                </View>
                {isSelected && (
                  <Icon
                    name="checkmark"
                    size={24}
                    color="primary"
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 24,
    gap: 20,
  },
  progressContainer: { marginBottom: 8 },
  title: { marginTop: 8 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  countryList: {
    marginTop: 8,
    gap: 12,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  countryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  flag: {
    fontSize: 28,
    lineHeight: 0,
  },
  countryName: { fontSize: 18 },
});
