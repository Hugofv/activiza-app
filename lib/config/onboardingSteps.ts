/**
 * Onboarding steps configuration
 * Define the order and mapping of onboarding steps
 * Easy to reorder by changing the array order
 */

export type OnboardingStepKey =
  | 'email'
  | 'password'
  | 'email_verification'
  | 'document'
  | 'name'
  | 'contact'
  | 'phone_verification'
  | 'active_customers'
  | 'financial_operations'
  | 'working_capital'
  | 'business_duration'
  | 'address' // Unified address screen (includes country, postal_code, and address stages)
  | 'terms'
  | 'customization'
  | 'options'
  | 'plans';

export interface OnboardingStep {
  key: OnboardingStepKey;
  route: string;
  apiStepName: string; // Nome usado na API
  requiresAuth: boolean; // Se requer autenticação
  isVerificationStep: boolean; // Se é uma etapa de verificação (endpoint diferente)
}

/**
 * Order of onboarding steps - change order here to reorder the flow
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  { key: 'email', route: '/onboarding/email', apiStepName: 'email', requiresAuth: false, isVerificationStep: false },
  { key: 'password', route: '/onboarding/password', apiStepName: 'password', requiresAuth: false, isVerificationStep: false },
  { key: 'email_verification', route: '/onboarding/codeEmail', apiStepName: 'email_verification', requiresAuth: true, isVerificationStep: true },
  { key: 'document', route: '/onboarding/document', apiStepName: 'document', requiresAuth: true, isVerificationStep: false },
  { key: 'name', route: '/onboarding/name', apiStepName: 'name', requiresAuth: true, isVerificationStep: false },
  { key: 'contact', route: '/onboarding/contact', apiStepName: 'contact', requiresAuth: true, isVerificationStep: false },
  { key: 'phone_verification', route: '/onboarding/codeContact', apiStepName: 'phone_verification', requiresAuth: true, isVerificationStep: true },
  { key: 'active_customers', route: '/onboarding/activeCustomers', apiStepName: 'active_customers', requiresAuth: true, isVerificationStep: false },
  { key: 'financial_operations', route: '/onboarding/financialOperations', apiStepName: 'financial_operations', requiresAuth: true, isVerificationStep: false },
  { key: 'working_capital', route: '/onboarding/capital', apiStepName: 'working_capital', requiresAuth: true, isVerificationStep: false },
  { key: 'business_duration', route: '/onboarding/businessDuration', apiStepName: 'business_duration', requiresAuth: true, isVerificationStep: false },
  { key: 'address', route: '/onboarding/address', apiStepName: 'address', requiresAuth: true, isVerificationStep: false }, // Unified: handles country, postal_code, and address stages internally
  { key: 'terms', route: '/onboarding/terms', apiStepName: 'terms', requiresAuth: true, isVerificationStep: false },
  { key: 'customization', route: '/onboarding/customization', apiStepName: 'customization', requiresAuth: true, isVerificationStep: false },
  { key: 'options', route: '/onboarding/options', apiStepName: 'options', requiresAuth: true, isVerificationStep: false },
  { key: 'plans', route: '/onboarding/plans', apiStepName: 'plans', requiresAuth: true, isVerificationStep: false },
];

/**
 * Get step by key
 */
export function getStepByKey(key: OnboardingStepKey): OnboardingStep | undefined {
  return ONBOARDING_STEPS.find(step => step.key === key);
}

/**
 * Get step by route
 */
export function getStepByRoute(route: string): OnboardingStep | undefined {
  return ONBOARDING_STEPS.find(step => step.route === route);
}

/**
 * Get step by API step name
 */
export function getStepByApiName(apiStepName: string): OnboardingStep | undefined {
  return ONBOARDING_STEPS.find(step => step.apiStepName === apiStepName);
}

/**
 * Get next step after current step
 */
export function getNextStep(currentStep: OnboardingStepKey): OnboardingStep | undefined {
  const currentIndex = ONBOARDING_STEPS.findIndex(step => step.key === currentStep);
  if (currentIndex === -1 || currentIndex === ONBOARDING_STEPS.length - 1) {
    return undefined;
  }
  return ONBOARDING_STEPS[currentIndex + 1];
}

/**
 * Get step index (for progress calculation)
 */
export function getStepIndex(step: OnboardingStepKey): number {
  return ONBOARDING_STEPS.findIndex(s => s.key === step);
}

/**
 * Map API step name to route
 */
export function getRouteFromApiStep(apiStepName: string): string | undefined {
  const step = ONBOARDING_STEPS.find(s => s.apiStepName === apiStepName);
  return step?.route;
}

/**
 * Create step to route map for easy lookup
 */
export function createStepToRouteMap(): Record<string, string> {
  return ONBOARDING_STEPS.reduce((acc, step) => {
    acc[step.apiStepName] = step.route;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Check if a step is completed based on current step
 * A step is completed if it comes before the current step in the flow
 */
export function isStepCompleted(
  stepToCheck: OnboardingStepKey,
  currentStep: OnboardingStepKey | null
): boolean {
  if (!currentStep) return false;

  const currentIndex = getStepIndex(currentStep);
  const checkIndex = getStepIndex(stepToCheck);

  // If step to check is before current step, it's completed
  return checkIndex < currentIndex;
}

/**
 * Check if onboarding is fully completed
 */
export function isOnboardingCompleted(
  clientStatus?: 'IN_PROGRESS' | 'COMPLETED'
): boolean {
  return clientStatus === 'COMPLETED';
}

/**
 * Get all completed steps based on current step
 */
export function getCompletedSteps(
  currentStep: OnboardingStepKey | null
): OnboardingStepKey[] {
  if (!currentStep) return [];

  const currentIndex = getStepIndex(currentStep);
  return ONBOARDING_STEPS.slice(0, currentIndex).map(step => step.key);
}

/**
 * Get the last completed step
 */
export function getLastCompletedStep(
  currentStep: OnboardingStepKey | null
): OnboardingStepKey | null {
  if (!currentStep) return null;

  const currentIndex = getStepIndex(currentStep);
  if (currentIndex === 0) return null;

  return ONBOARDING_STEPS[currentIndex - 1].key;
}

/**
 * Check if current step is the last step
 */
export function isLastStep(step: OnboardingStepKey): boolean {
  const index = getStepIndex(step);
  return index === ONBOARDING_STEPS.length - 1;
}
