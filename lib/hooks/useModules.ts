import { useQuery } from '@tanstack/react-query';

import { getModules } from '@/lib/services/onboardingService';

export const MODULES_QUERY_KEY = ['modules'] as const;

export function useModules() {
  return useQuery({
    queryKey: MODULES_QUERY_KEY,
    queryFn: getModules,
    staleTime: 1000 * 60 * 60, // 1 hour – modules don't change frequently
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
