import { Check } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '@shared/schema';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

export default function Pricing() {
  const [userId] = useState('demo-user');
  const { subscription, isLoading } = useSubscription(userId);
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    try {
      setCheckoutLoading(tier);

      // Check if upgrade (existing subscription)
      const isUpgrade = subscription && subscription.tier !== 'free' && subscription.tier !== tier;

      // Create Stripe Checkout Session (supports both new subscriptions and upgrades)
      const response = await apiRequest('POST', '/api/create-checkout-session', {
        tier,
        userId,
        isUpgrade,
      });

      const data = await response.json();

      // If upgrade was successful (no redirect URL)
      if (data.success && !data.url) {
        toast({
          title: 'Upgrade erfolgreich!',
          description: `Dein Abo wurde auf ${tier.charAt(0).toUpperCase() + tier.slice(1)} aktualisiert. Die Differenz wurde anteilig berechnet.`,
        });
        setCheckoutLoading(null);
        // Reload page to update UI
        setTimeout(() => window.location.reload(), 2000);
        return;
      }

      // Otherwise redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Fehler',
        description: 'Zahlungsvorgang konnte nicht gestartet werden.',
        variant: 'destructive',
      });
      setCheckoutLoading(null);
    }
  };

  const currentTier = subscription?.tier || 'free';

  const tiers: Array<{tier: SubscriptionTier; popular?: boolean}> = [
    { tier: 'plus' },
    { tier: 'premium', popular: true },
    { tier: 'family' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Wähle deinen perfekten Plan
        </h1>
        <p className="text-lg text-muted-foreground">
          100 Millionen Songs. Lossless Audio. Dolby Atmos. Unbegrenzte Möglichkeiten.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {tiers.map(({ tier, popular }) => {
          const tierData = SUBSCRIPTION_TIERS[tier];
          const isCurrentTier = currentTier === tier;
          const isUpgrade = currentTier === 'free' || (
            (currentTier === 'plus' && (tier === 'premium' || tier === 'family')) ||
            (currentTier === 'premium' && tier === 'family')
          );

          return (
            <Card
              key={tier}
              className={`relative p-8 ${popular ? 'border-primary border-2 scale-105' : ''} ${
                isCurrentTier ? 'bg-primary/5' : ''
              }`}
              data-testid={`card-tier-${tier}`}
            >
              {popular && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground"
                >
                  Beliebtester Plan
                </Badge>
              )}
              
              {isCurrentTier && (
                <Badge
                  className="absolute top-4 right-4 bg-green-500 text-white"
                >
                  Aktiv
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {tierData.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    {tierData.price.toFixed(2)}€
                  </span>
                  <span className="text-muted-foreground">/Monat</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tierData.features.adFree && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check size={20} weight="bold" className="text-primary shrink-0" />
                    <span>Werbefreies Streaming</span>
                  </li>
                )}
                {tierData.features.offlineDownloads && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check size={20} weight="bold" className="text-primary shrink-0" />
                    <span>Offline-Downloads</span>
                  </li>
                )}
                {tierData.features.unlimitedSkips && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check size={20} weight="bold" className="text-primary shrink-0" />
                    <span>Unbegrenzte Skips</span>
                  </li>
                )}
                {tierData.features.losslessAudio && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check size={20} weight="bold" className="text-primary shrink-0" />
                    <span>Lossless Audio (Hi-Res)</span>
                  </li>
                )}
                {tierData.features.dolbyAtmos && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check size={20} weight="bold" className="text-primary shrink-0" />
                    <span>Dolby Atmos Räumlicher Sound</span>
                  </li>
                )}
                {tierData.features.liveRooms && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check size={20} weight="bold" className="text-primary shrink-0" />
                    <span className="font-semibold text-primary">Live Music Rooms ✨</span>
                  </li>
                )}
                {tierData.features.maxAccounts > 1 && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check size={20} weight="bold" className="text-primary shrink-0" />
                    <span>Bis zu {tierData.features.maxAccounts} Konten</span>
                  </li>
                )}
              </ul>

              <Button
                className="w-full"
                variant={popular ? 'default' : 'outline'}
                disabled={isCurrentTier || checkoutLoading === tier}
                onClick={() => handleSubscribe(tier)}
                data-testid={`button-subscribe-${tier}`}
              >
                {checkoutLoading === tier ? 'Wird geladen...' : isCurrentTier ? 'Aktueller Plan' : isUpgrade ? 'Jetzt upgraden' : 'Jetzt abschließen'}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Du bist derzeit im <strong>{SUBSCRIPTION_TIERS[currentTier].name}</strong>-Plan
        </p>
        <p className="text-xs text-muted-foreground">
          Alle Pläne können monatlich gekündigt werden. Keine versteckten Kosten.
        </p>
      </div>
    </div>
  );
}
