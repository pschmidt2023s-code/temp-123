import { Check, Ticket, CreditCard, Gift, Copy } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '@shared/schema';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

type BillingPeriod = 'monthly' | 'yearly';

export default function Pricing() {
  const [userId] = useState('demo-user');
  const { subscription, isLoading } = useSubscription(userId);
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showGiftCardDialog, setShowGiftCardDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [selectedGiftTier, setSelectedGiftTier] = useState<SubscriptionTier | null>(null);
  const [giftCardEmail, setGiftCardEmail] = useState('');
  const [generatedGiftCard, setGeneratedGiftCard] = useState<{code: string; link: string} | null>(null);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Bitte geben Sie einen Gutscheincode ein');
      return;
    }

    try {
      const result = await apiRequest<any>('POST', '/api/validate-coupon', {
        code: couponCode,
        tier: 'plus',
      });

      setValidatedCoupon(result);
      setCouponError('');
      toast({
        title: 'Gutschein gültig!',
        description: `${result.discountType === 'percentage' ? result.discountValue + '%' : (result.discountValue / 100).toFixed(2) + '€'} Rabatt wird angewendet`,
      });
    } catch (error: any) {
      setCouponError(error.message || 'Ungültiger Gutscheincode');
      setValidatedCoupon(null);
    }
  };

  const initiateCheckout = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setShowPaymentDialog(true);
  };

  const handleSubscribe = async (paymentMethod: 'stripe' | 'paypal') => {
    if (!selectedTier) return;
    
    try {
      setCheckoutLoading(selectedTier);
      setShowPaymentDialog(false);

      // Check if upgrade (existing subscription)
      const isUpgrade = subscription && subscription.tier !== 'free' && subscription.tier !== selectedTier;

      if (paymentMethod === 'stripe') {
        // Create Stripe Checkout Session
        const data = await apiRequest<{ success?: boolean; url?: string }>('POST', '/api/create-checkout-session', {
          tier: selectedTier,
          userId,
          isUpgrade,
          couponCode: validatedCoupon ? couponCode : undefined,
        });

        // If upgrade was successful (no redirect URL)
        if (data.success && !data.url) {
          toast({
            title: 'Upgrade erfolgreich!',
            description: `Dein Abo wurde auf ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} aktualisiert. Die Differenz wurde anteilig berechnet.`,
          });
          setCheckoutLoading(null);
          setTimeout(() => window.location.reload(), 2000);
          return;
        }

        // Otherwise redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } else {
        // PayPal checkout
        const data = await apiRequest<{ success?: boolean; approvalUrl?: string }>('POST', '/api/paypal/create-order', {
          tier: selectedTier,
          userId,
          couponCode: validatedCoupon ? couponCode : undefined,
        });

        if (data.approvalUrl) {
          window.location.href = data.approvalUrl;
        } else {
          throw new Error('No PayPal approval URL returned');
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Zahlungsvorgang konnte nicht gestartet werden.',
        variant: 'destructive',
      });
      setCheckoutLoading(null);
      setShowPaymentDialog(false);
    }
  };

  const currentTier = subscription?.tier || 'free';

  const tiers: Array<{tier: SubscriptionTier; popular?: boolean}> = [
    { tier: 'plus' },
    { tier: 'premium', popular: true },
    { tier: 'family' },
  ];

  const calculateDiscountedPrice = (tier: SubscriptionTier) => {
    const tierData = SUBSCRIPTION_TIERS[tier];
    const basePrice = billingPeriod === 'monthly' ? tierData.price : tierData.yearlyPrice;
    
    if (!validatedCoupon) return basePrice;
    
    if (validatedCoupon.discountType === 'percentage') {
      return basePrice * (1 - validatedCoupon.discountValue / 100);
    }
    return Math.max(0, basePrice - validatedCoupon.discountValue / 100);
  };

  const getPrice = (tier: SubscriptionTier) => {
    const tierData = SUBSCRIPTION_TIERS[tier];
    return billingPeriod === 'monthly' ? tierData.price : tierData.yearlyPrice;
  };

  const handlePurchaseGiftCard = async (tier: SubscriptionTier) => {
    setSelectedGiftTier(tier);
    setShowGiftCardDialog(true);
  };

  const handleGenerateGiftCard = async () => {
    if (!selectedGiftTier || !giftCardEmail.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib eine E-Mail-Adresse ein',
        variant: 'destructive',
      });
      return;
    }

    try {
      const duration = billingPeriod === 'monthly' ? 1 : 12;
      const result = await apiRequest<{ code: string; link: string }>('POST', '/api/gift-cards/purchase', {
        tier: selectedGiftTier,
        durationMonths: duration,
        recipientEmail: giftCardEmail,
        userId,
      });

      setGeneratedGiftCard(result);
      toast({
        title: 'Gutscheinkarte erstellt!',
        description: `Link wurde an ${giftCardEmail} gesendet`,
      });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Gutscheinkarte konnte nicht erstellt werden',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Wähle deinen perfekten Plan
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          100 Millionen Songs. Lossless Audio. Dolby Atmos. Unbegrenzte Möglichkeiten.
        </p>
        
        <div className="flex justify-center mb-4">
          <Tabs value={billingPeriod} onValueChange={(val) => setBillingPeriod(val as BillingPeriod)}>
            <TabsList className="grid w-full max-w-[350px] grid-cols-2">
              <TabsTrigger value="monthly" data-testid="tab-monthly" className="flex items-center justify-center">
                Monatlich
              </TabsTrigger>
              <TabsTrigger value="yearly" data-testid="tab-yearly" className="flex flex-col items-center justify-center gap-0.5 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">Jährlich</span>
                  <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 h-auto">17%</Badge>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card className="max-w-md mx-auto mb-8 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Ticket size={24} weight="bold" className="text-primary" />
          <h3 className="text-lg font-semibold">Gutscheincode einlösen</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coupon">Gutscheincode</Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                placeholder="z.B. SOMMER2025"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError('');
                }}
                data-testid="input-coupon-code"
                className={couponError ? 'border-red-500' : ''}
              />
              <Button 
                onClick={validateCoupon} 
                disabled={!couponCode.trim()}
                data-testid="button-validate-coupon"
              >
                Prüfen
              </Button>
            </div>
            {couponError && (
              <p className="text-sm text-red-500">{couponError}</p>
            )}
            {validatedCoupon && (
              <div className="flex items-center gap-2 text-sm text-green-500">
                <Check size={16} weight="bold" />
                <span>
                  {validatedCoupon.discountType === 'percentage' 
                    ? `${validatedCoupon.discountValue}% Rabatt` 
                    : `${(validatedCoupon.discountValue / 100).toFixed(2)}€ Rabatt`}
                  {validatedCoupon.applicableTiers && validatedCoupon.applicableTiers.length > 0 && (
                    <> (gültig für: {validatedCoupon.applicableTiers.join(', ')})</>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

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
                  {validatedCoupon && (!validatedCoupon.applicableTiers || validatedCoupon.applicableTiers.includes(tier)) ? (
                    <>
                      <span className="text-2xl font-bold text-muted-foreground line-through">
                        {getPrice(tier).toFixed(2)}€
                      </span>
                      <span className="text-4xl font-bold text-primary">
                        {calculateDiscountedPrice(tier).toFixed(2)}€
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-foreground">
                      {getPrice(tier).toFixed(2)}€
                    </span>
                  )}
                  <span className="text-muted-foreground">/{billingPeriod === 'monthly' ? 'Monat' : 'Jahr'}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-green-500 mt-1">
                    Spare {((tierData.price * 12) - tierData.yearlyPrice).toFixed(2)}€ pro Jahr
                  </p>
                )}
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

              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant={popular ? 'default' : 'outline'}
                  disabled={isCurrentTier || checkoutLoading === tier}
                  onClick={() => initiateCheckout(tier)}
                  data-testid={`button-subscribe-${tier}`}
                >
                  {checkoutLoading === tier ? 'Wird geladen...' : isCurrentTier ? 'Aktueller Plan' : isUpgrade ? 'Jetzt upgraden' : 'Jetzt abschließen'}
                </Button>
                <Button
                  className="w-full"
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePurchaseGiftCard(tier)}
                  data-testid={`button-gift-${tier}`}
                >
                  <Gift size={16} weight="bold" className="mr-2" />
                  Als Geschenk kaufen
                </Button>
              </div>
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

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zahlungsmethode wählen</DialogTitle>
            <DialogDescription>
              Wähle deine bevorzugte Zahlungsmethode für {selectedTier ? SUBSCRIPTION_TIERS[selectedTier].name : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              className="w-full h-16 text-lg"
              variant="outline"
              onClick={() => handleSubscribe('stripe')}
              disabled={checkoutLoading !== null}
              data-testid="button-pay-stripe"
            >
              <CreditCard size={24} weight="bold" className="mr-3" />
              Kreditkarte / Stripe
            </Button>
            <Button
              className="w-full h-16 text-lg"
              variant="outline"
              onClick={() => handleSubscribe('paypal')}
              disabled={checkoutLoading !== null}
              data-testid="button-pay-paypal"
            >
              <svg className="mr-3" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.64h8.462c1.656 0 3.13.326 4.13 1.14.926.753 1.393 1.897 1.393 3.402 0 2.653-1.09 4.52-3.24 5.553-1.12.537-2.55.806-4.252.806H9.906l-1.274 7.356a.641.641 0 0 1-.633.74h-.923zm9.652-14.27c-.853-.71-2.202-1.067-4.013-1.067H8.912a.515.515 0 0 0-.508.427l-.862 4.976h3.277c1.42 0 2.557-.222 3.383-.66 1.526-.806 2.298-2.203 2.298-4.152 0-1.253-.387-2.134-1.172-2.524z"/>
              </svg>
              PayPal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showGiftCardDialog} onOpenChange={(open) => {
        setShowGiftCardDialog(open);
        if (!open) {
          setGeneratedGiftCard(null);
          setGiftCardEmail('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gutscheinkarte kaufen</DialogTitle>
            <DialogDescription>
              {selectedGiftTier && `Verschenke ${SUBSCRIPTION_TIERS[selectedGiftTier].name} - ${billingPeriod === 'monthly' ? '1 Monat' : '12 Monate'} für ${getPrice(selectedGiftTier).toFixed(2)}€`}
            </DialogDescription>
          </DialogHeader>
          {!generatedGiftCard ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="gift-email">E-Mail des Empfängers</Label>
                <Input
                  id="gift-email"
                  type="email"
                  placeholder="empfaenger@beispiel.de"
                  value={giftCardEmail}
                  onChange={(e) => setGiftCardEmail(e.target.value)}
                  data-testid="input-gift-email"
                />
                <p className="text-xs text-muted-foreground">
                  Der Einlöse-Link wird an diese E-Mail-Adresse gesendet
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleGenerateGiftCard}
                disabled={!giftCardEmail.trim()}
                data-testid="button-generate-gift-card"
              >
                <Gift size={20} weight="bold" className="mr-2" />
                Gutscheinkarte erstellen
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                  Gutscheinkarte erfolgreich erstellt!
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Ein Einlöse-Link wurde an {giftCardEmail} gesendet
                </p>
                <div className="space-y-2">
                  <Label className="text-xs">Gutscheincode:</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedGiftCard.code}
                      readOnly
                      className="font-mono"
                      data-testid="text-gift-code"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedGiftCard.code);
                        toast({
                          title: 'Kopiert!',
                          description: 'Code wurde in die Zwischenablage kopiert',
                        });
                      }}
                      data-testid="button-copy-code"
                    >
                      <Copy size={16} weight="bold" />
                    </Button>
                  </div>
                  <Label className="text-xs">Einlöse-Link:</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedGiftCard.link}
                      readOnly
                      className="font-mono text-xs"
                      data-testid="text-gift-link"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedGiftCard.link);
                        toast({
                          title: 'Kopiert!',
                          description: 'Link wurde in die Zwischenablage kopiert',
                        });
                      }}
                      data-testid="button-copy-link"
                    >
                      <Copy size={16} weight="bold" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
