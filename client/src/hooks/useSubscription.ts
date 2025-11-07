import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Subscription, SubscriptionTier, SubscriptionFeatures } from '@shared/schema';

interface SubscriptionResponse extends Partial<Subscription> {
  tier: SubscriptionTier;
  features: SubscriptionFeatures['features'];
}

export function useSubscription(userId: string | undefined) {
  const subscription = useQuery<SubscriptionResponse>({
    queryKey: ['/api/subscriptions/user', userId],
    enabled: !!userId,
  });

  const subscribe = useMutation({
    mutationFn: async (tier: SubscriptionTier) => {
      if (!userId) throw new Error('User ID required');
      return await apiRequest(`/api/subscriptions`, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          tier,
          status: 'active',
          autoRenew: true,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/user', userId] });
    },
  });

  const upgrade = useMutation({
    mutationFn: async (tier: SubscriptionTier) => {
      if (!userId || !subscription.data?.id) throw new Error('Subscription not found');
      return await apiRequest(`/api/subscriptions/${subscription.data.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ tier }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/user', userId] });
    },
  });

  const cancel = useMutation({
    mutationFn: async () => {
      if (!subscription.data?.id) throw new Error('Subscription not found');
      return await apiRequest(`/api/subscriptions/${subscription.data.id}/cancel`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/user', userId] });
    },
  });

  return {
    subscription: subscription.data,
    isLoading: subscription.isLoading,
    subscribe,
    upgrade,
    cancel,
  };
}
