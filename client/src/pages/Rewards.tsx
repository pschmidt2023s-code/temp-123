import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Gift, ShareNetwork, Copy, Check } from '@phosphor-icons/react';

export default function Rewards() {
  const { toast } = useToast();
  const userId = 'demo-user';
  const [giftCode, setGiftCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  const { data: referrals = [] } = useQuery({
    queryKey: ['/api/referrals', userId],
    queryFn: async () => {
      const res = await fetch(`/api/referrals/${userId}`);
      return res.json();
    },
  });

  const myReferralCode = referrals.find((r: any) => r.status === 'pending')?.referralCode;

  const generateReferralMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/referrals/generate', 'POST', { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referrals', userId] });
      toast({
        title: 'Empfehlungscode erstellt!',
        description: 'Teile ihn mit deinen Freunden',
      });
    },
  });

  const redeemGiftCardMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest('/api/gift-cards/redeem', 'POST', { code, userId });
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Gutschein eingelöst!',
        description: `${data.months} Monat${data.months > 1 ? 'e' : ''} ${data.tier} hinzugefügt`,
      });
      setGiftCode('');
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Ungültiger Code',
        variant: 'destructive',
      });
    },
  });

  const applyReferralMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest('/api/referrals/apply', 'POST', { code, userId });
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Empfehlung angenommen!',
        description: data.reward,
      });
      setReferralCode('');
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Ungültiger Code',
        variant: 'destructive',
      });
    },
  });

  const copyReferralCode = () => {
    if (!myReferralCode) return;
    navigator.clipboard.writeText(myReferralCode);
    setCodeCopied(true);
    toast({ title: 'Code kopiert!' });
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const completedReferrals = referrals.filter((r: any) => r.status === 'completed');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Gift size={32} weight="bold" className="text-primary" />
        <h1 className="text-3xl font-bold" data-testid="heading-rewards">Geschenke & Codes</h1>
      </div>

      <Tabs defaultValue="giftcards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-14 p-1">
          <TabsTrigger value="giftcards" data-testid="tab-giftcards" className="flex items-center justify-center gap-2 h-full text-base font-semibold">
            <Gift size={20} weight="bold" />
            Gutscheine
          </TabsTrigger>
          <TabsTrigger value="referral" data-testid="tab-referral" className="flex items-center justify-center gap-2 h-full text-base font-semibold">
            <ShareNetwork size={20} weight="bold" />
            <span className="hidden sm:inline">Freunde werben</span>
            <span className="sm:hidden">Werben</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="giftcards" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4" data-testid="heading-redeem-gift-card">Gutschein einlösen</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Hast du einen Gutschein-Code? Löse ihn hier ein und erhalte sofort Zugriff auf Premium-Features!
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="gift-code" className="sr-only">Gutschein-Code</Label>
                <Input
                  id="gift-code"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  maxLength={19}
                  data-testid="input-gift-code"
                />
              </div>
              <Button
                onClick={() => redeemGiftCardMutation.mutate(giftCode)}
                disabled={!giftCode || redeemGiftCardMutation.isPending}
                data-testid="button-redeem-gift-card"
              >
                {redeemGiftCardMutation.isPending ? 'Wird eingelöst...' : 'Einlösen'}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <h3 className="font-semibold mb-2">Wo bekomme ich Gutscheine?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Bei Promotion-Aktionen und Events</li>
              <li>• Als Geschenk von Freunden</li>
              <li>• Bei Partner-Händlern</li>
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="referral" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4" data-testid="heading-your-referral-code">Dein Empfehlungscode</h2>
            
            {myReferralCode ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Dein Code</p>
                      <p className="text-2xl font-bold font-mono" data-testid="text-referral-code">{myReferralCode}</p>
                    </div>
                    <Button onClick={copyReferralCode} variant="outline" size="icon" data-testid="button-copy-referral">
                      {codeCopied ? <Check size={20} weight="bold" /> : <Copy size={20} weight="bold" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">So funktioniert's:</h3>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Teile deinen Code mit Freunden</li>
                    <li>2. Dein Freund erhält <strong>1 Monat Premium gratis</strong></li>
                    <li>3. Du erhältst <strong>1 Monat gratis</strong> wenn sie sich anmelden</li>
                  </ol>
                </div>

                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Erfolgreiche Empfehlungen</p>
                      <p className="text-xs text-muted-foreground">Du hast {completedReferrals.length} Freunde geworben</p>
                    </div>
                    <div className="text-2xl font-bold text-primary" data-testid="text-successful-referrals">{completedReferrals.length}</div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShareNetwork size={48} weight="light" className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Noch keinen Empfehlungscode?</p>
                <Button onClick={() => generateReferralMutation.mutate()} disabled={generateReferralMutation.isPending} data-testid="button-generate-referral">
                  {generateReferralMutation.isPending ? 'Wird erstellt...' : 'Code generieren'}
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4" data-testid="heading-use-referral-code">Empfehlungscode einlösen</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Hat ein Freund dich eingeladen? Gib seinen Code ein und ihr bekommt beide Prämien!
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="referral-code" className="sr-only">Empfehlungscode</Label>
                <Input
                  id="referral-code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="CODE123456789"
                  maxLength={16}
                  data-testid="input-referral-code"
                />
              </div>
              <Button
                onClick={() => applyReferralMutation.mutate(referralCode)}
                disabled={!referralCode || applyReferralMutation.isPending}
                data-testid="button-apply-referral"
              >
                {applyReferralMutation.isPending ? 'Wird angewendet...' : 'Anwenden'}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
