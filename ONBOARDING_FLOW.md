# Complete Onboarding Flow Documentation

## Full User Journey (19 Screens)

```
┌─────────────────────────────────────────────────────────────────┐
│                   1. WELCOME SCREEN                              │
│                   /onboarding/index                              │
│                                                                   │
│  Progress: N/A (Welcome screen)                                  │
│  • Logo display                                                   │
│  • Title: "Tudo para você gerenciar seus empréstimos..."          │
│  • Illustration                                                  │
│  • Button: "Começar" / "Start"                                   │
│                                                                   │
│  ⚠️ CURRENTLY NAVIGATES TO: /onboarding/businessDuration         │
│  ⚠️ SHOULD NAVIGATE TO: /onboarding/document                     │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   2. DOCUMENT SCREEN                             │
│                   /onboarding/document                           │
│                                                                   │
│  Progress: 9%                                                    │
│  • Input: CPF/CNPJ (Brazil) or Document Number                   │
│  • Auto-formatting as user types                                │
│  • Validation: CPF algorithm / CNPJ format                │
│  • Navigation: → /onboarding/name                                │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   3. NAME SCREEN                                 │
│                   /onboarding/name                               │
│                                                                   │
│  Progress: 18%                                                   │
│  • Input: Full Name                                              │
│  • Validation: Required, min length                               │
│  • Navigation: → /onboarding/contact                             │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   4. CONTACT SCREEN                              │
│                   /onboarding/contact                            │
│                                                                   │
│  Progress: 27%                                                   │
│  • Input: Phone Number (WhatsApp)                                 │
│  • Phone input with country code selector                        │
│  • Validation: Valid phone format                                │
│  • Navigation: → /onboarding/codeContact                         │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   5. CODE CONTACT SCREEN                         │
│                   /onboarding/codeContact                        │
│                                                                   │
│  Progress: 36%                                                   │
│  • Input: 6-digit verification code                              │
│  • Sent via WhatsApp                                             │
│  • Resend code button (60-second timer)                          │
│  • Validation: 6 digits required                                 │
│  • Navigation: → /onboarding/confirmContact                      │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   6. CONFIRM CONTACT SCREEN                      │
│                   /onboarding/confirmContact                     │
│                                                                   │
│  Transition: Fade (400ms)                                        │
│  Progress: N/A (Confirmation screen)                             │
│  • Success message: "WhatsApp Verificado"                        │
│  • Confirmation illustration                                     │
│  • Continue button                                               │
│  • Navigation: → /onboarding/email                               │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   7. EMAIL SCREEN                                │
│                   /onboarding/email                              │
│                                                                   │
│  Progress: 45%                                                   │
│  • Input: Email Address                                          │
│  • Validation: Valid email format                                │
│  • Navigation: → /onboarding/codeEmail                           │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   8. CODE EMAIL SCREEN                           │
│                   /onboarding/codeEmail                          │
│                                                                   │
│  Progress: 54%                                                   │
│  • Input: 6-digit verification code                              │
│  • Sent via Email                                                │
│  • Resend code button (60-second timer)                          │
│  • Validation: 6 digits required                                 │
│  • Navigation: → /onboarding/confirmEmail                        │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   9. CONFIRM EMAIL SCREEN                        │
│                   /onboarding/confirmEmail                       │
│                                                                   │
│  Transition: Fade (400ms)                                        │
│  Progress: N/A (Confirmation screen)                             │
│  • Success message: "E-mail Verificado"                          │
│  • Confirmation illustration                                     │
│  • Continue button                                               │
│  • Navigation: → /onboarding/password                            │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   10. PASSWORD SCREEN                            │
│                   /onboarding/password                           │
│                                                                   │
│  Progress: 54%                                                   │
│  • Input: Password                                                │
│  • Input: Confirm Password                                        │
│  • Password visibility toggle                                     │
│  • Real-time validation rules:                                   │
│    ✓ At least 8 characters                                       │
│    ✓ At least one uppercase letter                               │
│    ✓ At least one lowercase letter                               │
│    ✓ At least one number                                         │
│    ✓ At least one special character                              │
│    ✓ Passwords must match                                        │
│  • Navigation: → /onboarding/activeCustomers                     │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   11. ACTIVE CUSTOMERS SCREEN                    │
│                   /onboarding/activeCustomers                    │
│                                                                   │
│  Progress: 54%                                                   │
│  • Question: "Quantos clientes ativos você tem?"                 │
│  • Description: "Clientes com serviços ativos ou pendentes."     │
│  • Options (ListCheck):                                          │
│    - Até 20 (Up to 20)                                           │
│    - 21 a 50 (21 to 50)                                          │
│    - 51 a 100 (51 to 100)                                        │
│    - 101 a 300 (101 to 300)                                      │
│    - Mais de 300 (More than 300)                                 │
│  • Navigation: → /onboarding/financialOperations                 │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   12. FINANCIAL OPERATIONS SCREEN                │
│                   /onboarding/financialOperations                │
│                                                                   │
│  Progress: 59%                                                   │
│  • Question: "Quantas operações financeiras você faz por mês?"   │
│  • Description: "Entre empréstimos, aluguéis e promissórias."    │
│  • Options (ListCheck):                                          │
│    - Até 5 (Up to 5)                                             │
│    - 6 a 10 (6 to 10)                                            │
│    - 11 a 20 (11 to 20)                                          │
│    - 21 a 50 (21 to 50)                                          │
│    - 51 a 100 (51 to 100)                                        │
│    - 101 a 200 (101 to 200)                                      │
│    - Mais de 200 (More than 200)                                 │
│  • Navigation: → /onboarding/capital                             │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   13. CAPITAL SCREEN                             │
│                   /onboarding/capital                            │
│                                                                   │
│  Progress: 63%                                                   │
│  • Question: "Qual seu capital de giro atual?"                   │
│  • Options (ListCheck):                                          │
│    - Até 5 mil (Up to 5 thousand)                                │
│    - 5 mil a 20 mil (5 thousand to 20 thousand)                  │
│    - 20 mil a 50 mil (20 thousand to 50 thousand)                │
│    - 50 mil a 100 mil (50 thousand to 100 thousand)              │
│    - Mais de 100 mil (More than 100 thousand)                    │
│  • Navigation: → /onboarding/businessDuration                    │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   14. BUSINESS DURATION SCREEN                   │
│                   /onboarding/businessDuration                   │
│                                                                   │
│  Progress: 68%                                                   │
│  • Question: "Há quanto tempo você está no negócio?"             │
│  • Options (ListCheck):                                          │
│    - Menos de 6 meses (Less than 6 months)                       │
│    - 6 meses a 1 ano (6 months to 1 Year)                        │
│    - 1 a 3 anos (1 to 3 years)                                   │
│    - Mais de 3 anos (More than 3 years)                          │
│  • Navigation: → /onboarding/country                             │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   15. COUNTRY SCREEN                             │
│                   /onboarding/country                            │
│                                                                   │
│  Progress: 72%                                                   │
│  • Question: "Selecione seu país"                                │
│  • Options (ListCheck with flags):                               │
│    🇧🇷 Brasil (Brazil)                                            │
│    🇺🇸 Estados Unidos (United States)                             │
│    🇬🇧 Reino Unido (United Kingdom)                               │
│  • Navigation: → /onboarding/postalCode                          │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   16. POSTAL CODE SCREEN                         │
│                   /onboarding/postalCode                         │
│                                                                   │
│  Progress: 72%                                                   │
│  • Input: Postal Code (CEP/ZIP/Postcode)                         │
│  • Auto-lookup via API:                                          │
│    - Brazil: ViaCEP (https://viacep.com.br)                      │
│    - USA: Zippopotam.us (https://api.zippopotam.us)              │
│    - UK: postcodes.io (https://api.postcodes.io)                  │
│  • Loading state during lookup                                   │
│  • Auto-fills address fields when found                          │
│  • Keyboard type: Alphanumeric for UK, numeric for others        │
│  • Navigation: → /onboarding/address                             │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   17. ADDRESS SCREEN                             │
│                   /onboarding/address                            │
│                                                                   │
│  Progress: 81%                                                   │
│  • Fields (scrollable container):                                 │
│    - Postal Code (disabled if API-filled)                        │
│    - Street (disabled if API-filled)                              │
│    - Neighborhood (disabled if API-filled)                       │
│    - City (disabled if API-filled)                               │
│    - State (disabled if API-filled)                              │
│    - Country (disabled if API-filled)                            │
│    - Number                                                       │
│    - Complement (optional)                                        │
│  • Auto-scrolls to first error on validation                     │
│  • Fields filled by API are disabled (grayed out)              │
│  • Navigation: → /onboarding/terms                               │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   18. TERMS SCREEN                               │
│                   /onboarding/terms                              │
│                                                                   │
│  Progress: 90%                                                   │
│  • Checkbox: Terms of Use (opens modal)                          │
│  • Checkbox: Privacy Policy (opens modal)                        │
│  • Both checkboxes required to continue                           │
│  • Modals contain scrollable terms/privacy content                │
│  • Navigation: → /onboarding/registerFinished (commented out)    │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   19. REGISTER FINISHED SCREEN                   │
│                   /onboarding/registerFinished                   │
│                                                                   │
│  Transition: Fade (500ms)                                        │
│  Progress: 100%                                                  │
│  • Title: "Cadastro concluído" / "Registration Complete"          │
│  • Description: Success message                                  │
│  • Illustration: registrationComplete.svg                         │
│  • Circular button: Navigate to Login                            │
│  • Navigation: → /login (router.replace)                         │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                          ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   20. LOGIN SCREEN                               │
│                   /login                                         │
│                                                                   │
│  • User can now log in with their credentials                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Screen Transitions

| Screen | Transition Type | Duration | Progress |
|--------|----------------|----------|----------|
| Welcome → Document | Slide from Right | 300ms | N/A → 9% |
| Document → Name | Slide from Right | 300ms | 9% → 18% |
| Name → Contact | Slide from Right | 300ms | 18% → 27% |
| Contact → Code Contact | Slide from Right | 300ms | 27% → 36% |
| Code Contact → Confirm Contact | **Fade** | 400ms | 36% → N/A |
| Confirm Contact → Email | Slide from Right | 300ms | N/A → 45% |
| Email → Code Email | Slide from Right | 300ms | 45% → 54% |
| Code Email → Confirm Email | **Fade** | 400ms | 54% → N/A |
| Confirm Email → Password | Slide from Right | 300ms | N/A → 54% |
| Password → Active Customers | Slide from Right | 300ms | 54% → 54% |
| Active Customers → Financial Operations | Slide from Right | 300ms | 54% → 59% |
| Financial Operations → Capital | Slide from Right | 300ms | 59% → 63% |
| Capital → Business Duration | Slide from Right | 300ms | 63% → 68% |
| Business Duration → Country | Slide from Right | 300ms | 68% → 72% |
| Country → Postal Code | Slide from Right | 300ms | 72% → 72% |
| Postal Code → Address | Slide from Right | 300ms | 72% → 81% |
| Address → Terms | Slide from Right | 300ms | 81% → 90% |
| Terms → Register Finished | **Fade** | 500ms | 90% → 100% |
| Register Finished → Login | **Fade** | 400ms | 100% → N/A |

## Data Flow

### Form Data Structure
All data is stored in `OnboardingFormContext` and persists across screens:

```typescript
{
  document: string;
  name: string;
  phone: {
    country: string | null;
    countryCode: string;
    phoneNumber: string;
    formattedPhoneNumber: string;
  } | null;
  email: string;
  code?: string;              // WhatsApp verification
  emailCode?: string;          // Email verification
  password?: string;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  activeCustomers?: string;    // 'upTo20' | '21To50' | '51To100' | '101To300' | 'moreThan300'
  financialOperations?: string; // 'upTo5' | '6To10' | '11To20' | '21To50' | '51To100' | '101To200' | 'moreThan200'
  workingCapital?: string;      // 'upTo5k' | '5kTo20k' | '20kTo50k' | '50kTo100k' | 'moreThan100k'
  businessDuration?: string;    // 'lessThan6Months' | '6MonthsTo1Year' | '1To3Years' | 'moreThan3Years'
  address?: {
    postalCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    countryCode?: string;
    number: string;
    complement?: string;
    _apiFilled?: {             // Internal tracking
      postalCode?: boolean;
      street?: boolean;
      neighborhood?: boolean;
      city?: boolean;
      state?: boolean;
      country?: boolean;
    };
  };
}
```

### Data Submission
- **Trigger**: When user accepts terms and clicks continue
- **Location**: `contexts/onboardingFormContext.tsx` → `saveFormData()`
- **Status**: Currently commented out - needs API integration
- **Endpoint**: `/onboarding/save` (to be implemented)

## Key Features

### 1. Progress Tracking
- Progress bar on each screen showing completion percentage
- Visual feedback of user's position in the flow
- Progress ranges from 9% to 100%

### 2. Form Persistence
- All form data saved in context
- Data persists when navigating back/forward
- Can resume from any point

### 3. Validation
- Real-time validation with `react-hook-form` + `yup`
- Country-specific validation (e.g., CPF for Brazil, postal codes)
- Auto-scroll to first error field on submission

### 4. API Integration
- **Postal Code Lookup**: Auto-fills address fields
  - Brazil: ViaCEP
  - USA: Zippopotam.us
  - UK: postcodes.io
- **Field Disabling**: API-filled fields are disabled to prevent accidental edits

### 5. Internationalization
- Supports Portuguese (Brazil) and English (UK)
- Country names, labels, and messages translated
- Locale-aware formatting

### 6. User Experience
- Smooth transitions between screens
- Loading states during API calls
- Error handling with user-friendly messages
- Password visibility toggle
- Resend code functionality with timer
- ListCheck component for consistent option selection

### 7. Reusable Components
- **ListCheck**: Reusable component for radio button-style lists
  - Used in: Active Customers, Financial Operations, Capital, Business Duration, Country
  - Supports custom left content (e.g., flags for countries)
  - Themed selection states

## Known Issues

1. **Welcome Screen Navigation**: 
   - ⚠️ Currently navigates to `/onboarding/businessDuration`
   - Should navigate to `/onboarding/document`
   - File: `app/onboarding/index.tsx` line 23

2. **Terms Screen Navigation**:
   - ⚠️ Navigation to `/onboarding/registerFinished` is commented out
   - File: `app/onboarding/terms.tsx` line 59

## Navigation Methods

- **Forward**: `router.push('/onboarding/nextScreen')`
- **Backward**: `router.back()`
- **Replace**: `router.replace('/login')` (used on register finished)

## Validation Rules

### Document (Brazil)
- CPF: 11 digits, valid algorithm
- CNPJ: 14 digits

### Phone
- Valid international format
- Country code required

### Email
- Valid email format

### Password
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Must match confirmation password

### Postal Code
- **Brazil**: 8 digits (00000-000)
- **USA**: 5 or 9 digits (12345 or 12345-6789)
- **UK**: Alphanumeric (SW1A 1AA)

### Address
- All fields required except complement
- Country-specific validation

## Error Handling

1. **Form Validation Errors**
   - Displayed below each field
   - Auto-scroll to first error on submit
   - Real-time validation feedback

2. **API Errors**
   - Postal code lookup failures: User can fill manually
   - Network errors: Graceful fallback
   - Error messages in user's language

3. **Navigation Errors**
   - Back button always available
   - Can navigate back to fix errors

## Completion Flow

1. User completes all screens (1-18)
2. Accepts Terms of Use and Privacy Policy
3. Clicks "Continue" on Terms screen
4. `saveFormData()` is called (currently logs to console)
5. Navigates to Register Finished screen
6. Shows success message with 100% progress
7. User clicks button to go to Login screen
8. Can now log in with created credentials
