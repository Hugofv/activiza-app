import { Colors, Fonts } from '@/constants/theme';
import React, { useState } from 'react';
import { useColorScheme } from 'react-native';
import InternationalPhoneInput, {
   ICountry,
   ITheme,
} from 'react-native-international-phone-number';
import { Icon } from './icon';

interface PhoneInputValue {
  country: string | null;
  countryCode: string;
  phoneNumber: string;
  formattedPhoneNumber: string;
}
interface PhoneInputProps {
  value: PhoneInputValue | null;
  onChangeText: (value: PhoneInputValue) => void;
}

const PhoneInput = ({ value, onChangeText }: PhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [currentValue, setCurrentValue] = useState('');
  const theme = useColorScheme();
  const colors = Colors[theme ?? 'light'];
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
  return (
    <InternationalPhoneInput
      value={currentValue}
      theme={theme === 'dark' ? 'dark' : ('light' as ITheme)}
      defaultCountry='BR'
      defaultValue={value?.formattedPhoneNumber ?? ''}
      onChangePhoneNumber={handleInputValue}
      selectedCountry={selectedCountry}
      onChangeSelectedCountry={handleSelectedCountry}
      placeholder='Digite seu telefone'
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
          borderBottomColor: colors.icon,
          backgroundColor: 'transparent',
        },
        caret: {},
      }}
    />
  );
};

export { PhoneInput };
