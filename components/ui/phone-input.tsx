import { Colors, Fonts } from '@/constants/theme';
import React, { useState } from 'react';
import { Control, Controller, FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useColorScheme, View } from 'react-native';
import InternationalPhoneInput, {
  ICountry,
  ICountrySelectLanguages,
  ITheme,
} from 'react-native-international-phone-number';
import { Icon } from './icon';
import { Typography } from './typography';

export interface PhoneInputValue {
  country: string | null;
  countryCode: string;
  phoneNumber: string;
  formattedPhoneNumber: string;
}

interface PhoneInputProps {
  value?: PhoneInputValue | null;
  onChangeText?: (value: PhoneInputValue) => void;
  // RHF props (optional)
  name?: FieldPath<any>;
  control?: Control<any>;
  error?: string;
}

const PhoneInputComponent = ({ 
  value, 
  onChangeText, 
  error 
}: { 
  value: PhoneInputValue | null; 
  onChangeText: (value: PhoneInputValue) => void;
  error?: string;
}) => {
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [currentValue, setCurrentValue] = useState('');
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
  const { i18n } = useTranslation();
  const languageCode = i18n.language.split('-')[0];

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }

  function handleInputValue(phoneNumber: string) {
    setCurrentValue(phoneNumber);
    const formattedPhoneNumber = {
      country: selectedCountry?.cca2 ?? null,
      countryCode: selectedCountry?.idd?.root ?? '',
      phoneNumber,
      formattedPhoneNumber: `${selectedCountry?.idd?.root} ${phoneNumber}`,
    };

    onChangeText(formattedPhoneNumber);
  }

  const phoneLanguage = {
    en: 'eng',
    pt: 'por',
  };

  return (
    <View>
      <InternationalPhoneInput
        value={currentValue}
        theme={theme === 'dark' ? 'dark' : ('light' as ITheme)}
        defaultCountry='BR'
        defaultValue={value?.formattedPhoneNumber ?? ''}
        onChangePhoneNumber={handleInputValue}
        selectedCountry={selectedCountry}
        onChangeSelectedCountry={handleSelectedCountry}
        language={
          (phoneLanguage[
            languageCode as keyof typeof phoneLanguage
          ] as ICountrySelectLanguages) ?? 'por'
        }
        popularCountries={['BR', 'GB', 'US']}
        customCaret={() => (
          <Icon name='chevron-down' size={24} color={colors.text} />
        )}
        phoneInputStyles={{
          divider: {
            display: 'none',
          },
          input: {
            borderWidth: 0,
            fontSize: 18,
            fontFamily: Fonts.sans,
          },
          callingCode: {
            fontSize: 18,
          },
          flagContainer: {
            backgroundColor: 'transparent',
          },
          container: {
            borderWidth: 0,
            borderBottomWidth: 1,
            borderBottomColor: error ? '#ef4444' : colors.icon,
            backgroundColor: 'transparent',
          },
          caret: {},
        }}
      />
      {error && (
        <Typography variant="caption" style={{ color: '#ef4444', marginTop: 4 }}>
          {error}
        </Typography>
      )}
    </View>
  );
};

const PhoneInput = ({ name, control, error, value, onChangeText }: PhoneInputProps) => {
  // If RHF props are provided, use Controller
  if (name && control) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value: fieldValue } }) => (
          <PhoneInputComponent
            value={(fieldValue as PhoneInputValue) || null}
            onChangeText={onChange}
            error={error}
          />
        )}
      />
    );
  }

  // Regular phone input without RHF
  if (value !== undefined && onChangeText) {
    return (
      <PhoneInputComponent
        value={value}
        onChangeText={onChangeText}
        error={error}
      />
    );
  }

  return null;
};

export { PhoneInput };
