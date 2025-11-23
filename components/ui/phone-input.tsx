import React, { useState } from 'react';
import InternationalPhoneInput, {
   ICountry,
} from 'react-native-international-phone-number';
import { Icon } from './icon';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
}
const PhoneInput = ({ value, onChangeText }: PhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [currentValue, setCurrentValue] = useState('');

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }

  function handleInputValue(phoneNumber: string) {
    setCurrentValue(phoneNumber);
    const formattedPhoneNumber = `${selectedCountry?.idd?.root} ${phoneNumber}`;

    onChangeText(formattedPhoneNumber);
  }
  return (
    <InternationalPhoneInput
      value={currentValue}
      defaultCountry='BR'
      onChangePhoneNumber={handleInputValue}
      selectedCountry={selectedCountry}
      onChangeSelectedCountry={handleSelectedCountry}
      placeholder='Digite seu telefone'
      popularCountries={['BR', 'GB', 'US']}
      customCaret={() => <Icon name='chevron-down' size={24} color='black' />}
      phoneInputStyles={{
        divider: {
          display: 'none',
        },
        input: {
          borderWidth: 0,
        },
        flagContainer: {
          backgroundColor: 'transparent',
        },
        container: {
          borderWidth: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'gray',
        },
        caret: {},
      }}
    />
  );
};

export { PhoneInput };
