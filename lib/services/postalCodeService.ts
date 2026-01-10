/**
 * Postal code lookup service
 * Supports multiple countries with different APIs
 * Migrated from postalCode.ts to follow camelCase naming convention
 */

export interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export type CountryCode = 'BR' | 'US' | 'UK';

/**
 * Lookup address by postal code for Brazil (ViaCEP)
 */
async function lookupBrazilPostalCode(postalCode: string): Promise<AddressData | null> {
  try {
    // Remove formatting
    const cleanCode = postalCode.replace(/\D/g, '');
    
    if (cleanCode.length !== 8) {
      return null;
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCode}/json/`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // ViaCEP returns error object if not found
    if (data.erro) {
      return null;
    }

    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      country: 'Brasil',
      postalCode: data.cep || postalCode,
    };
  } catch (error) {
    console.error('Error fetching Brazil postal code:', error);
    return null;
  }
}

/**
 * Lookup address by postal code for USA (Zippopotam.us - free, no API key)
 */
async function lookupUSPostalCode(postalCode: string): Promise<AddressData | null> {
  try {
    const cleanCode = postalCode.replace(/\D/g, '');
    
    if (cleanCode.length !== 5 && cleanCode.length !== 9) {
      return null;
    }

    const code = cleanCode.length === 9 ? `${cleanCode.slice(0, 5)}-${cleanCode.slice(5)}` : cleanCode;
    const response = await fetch(`https://api.zippopotam.us/us/${code}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.places || data.places.length === 0) {
      return null;
    }

    const place = data.places[0];

    return {
      street: '',
      neighborhood: place['place name'] || '',
      city: place['place name'] || '',
      state: place.state || '',
      country: 'United States',
      postalCode: data['post code'] || postalCode,
    };
  } catch (error) {
    console.error('Error fetching US postal code:', error);
    return null;
  }
}

/**
 * Lookup address by postal code for UK (postcodes.io - free, no API key)
 */
async function lookupUKPostalCode(postalCode: string): Promise<AddressData | null> {
  try {
    // Remove spaces and convert to uppercase
    const cleanCode = postalCode.replace(/\s/g, '').toUpperCase();
    
    if (cleanCode.length < 5 || cleanCode.length > 8) {
      return null;
    }

    const response = await fetch(`https://api.postcodes.io/postcodes/${cleanCode}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status !== 200 || !data.result) {
      return null;
    }

    const result = data.result;

    return {
      street: result.thoroughfare || result.street || '',
      neighborhood: result.ward || result.admin_ward || '',
      city: result.post_town || result.town || '',
      state: result.region || result.country || '',
      country: 'United Kingdom',
      postalCode: result.postcode || postalCode,
    };
  } catch (error) {
    console.error('Error fetching UK postal code:', error);
    return null;
  }
}

/**
 * Generic postal code lookup - returns null for unsupported countries
 * You can extend this with more country-specific APIs
 */
async function lookupGenericPostalCode(
  postalCode: string,
  country: string
): Promise<AddressData | null> {
  // For now, return null for unsupported countries
  // You can add more country-specific implementations here
  // Examples:
  // - Canada: https://geocoder.ca/?geoit=XML&postal={code}
  // - etc.
  
  return null;
}

/**
 * Main function to lookup address by postal code
 */
export async function lookupPostalCode(
  postalCode: string,
  countryCode: CountryCode
): Promise<AddressData | null> {
  switch (countryCode) {
    case 'BR':
      return lookupBrazilPostalCode(postalCode);
    case 'US':
      return lookupUSPostalCode(postalCode);
    case 'UK':
      return lookupUKPostalCode(postalCode);
    default:
      return lookupGenericPostalCode(postalCode, countryCode);
  }
}

/**
 * Get postal code format/mask for a country
 */
export function getPostalCodeFormat(countryCode: CountryCode): {
  mask: string;
  placeholder: string;
  maxLength: number;
  format: (value: string) => string;
} {
  switch (countryCode) {
    case 'BR':
      return {
        mask: '00000-000',
        placeholder: '00000-000',
        maxLength: 9,
        format: (value: string) => {
          const numbers = value.replace(/\D/g, '');
          if (numbers.length <= 5) {
            return numbers;
          }
          return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
        },
      };
    case 'US':
      return {
        mask: '00000-0000',
        placeholder: '12345-6789',
        maxLength: 10,
        format: (value: string) => {
          const numbers = value.replace(/\D/g, '');
          if (numbers.length <= 5) {
            return numbers;
          }
          return `${numbers.slice(0, 5)}-${numbers.slice(5, 9)}`;
        },
      };
    case 'UK':
      return {
        mask: 'AA9A 9AA',
        placeholder: 'SW1A 1AA',
        maxLength: 8,
        format: (value: string) => {
          // UK postcode format: AA9A 9AA (with space)
          // Remove all non-alphanumeric except spaces
          const cleaned = value.replace(/[^A-Za-z0-9\s]/g, '').toUpperCase();
          // Remove extra spaces
          const noSpaces = cleaned.replace(/\s/g, '');
          
          // Format: first part (2-4 chars) + space + last part (3 chars)
          if (noSpaces.length <= 3) {
            return noSpaces;
          } else if (noSpaces.length <= 6) {
            // Insert space after 3-4 characters
            const firstPart = noSpaces.slice(0, noSpaces.length - 3);
            const lastPart = noSpaces.slice(noSpaces.length - 3);
            return `${firstPart} ${lastPart}`;
          } else {
            // Limit to 8 characters total (including space)
            const firstPart = noSpaces.slice(0, 4);
            const lastPart = noSpaces.slice(4, 7);
            return `${firstPart} ${lastPart}`;
          }
        },
      };
    default:
      return {
        mask: '00000',
        placeholder: '00000',
        maxLength: 10,
        format: (value: string) => value.replace(/\D/g, ''),
      };
  }
}
