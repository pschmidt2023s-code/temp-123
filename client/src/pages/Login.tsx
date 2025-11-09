import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SignIn, UserPlus, Key, Shield, Fingerprint } from '@phosphor-icons/react';
import { startAuthentication } from '@simplewebauthn/browser';

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
});

type LoginForm = z.infer<typeof loginSchema>;

type LoginStep = 'credentials' | 'twoFactor' | 'passkey';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginStep, setLoginStep] = useState<LoginStep>('credentials');
  const [pendingUserId, setPendingUserId] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Initial login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      return await apiRequest<{ 
        id: string; 
        username: string; 
        email: string;
        requiresTwoFactor?: boolean;
        userId?: string;
      }>('POST', '/api/auth/login', data);
    },
    onSuccess: (data) => {
      if (data.requiresTwoFactor) {
        setPendingUserId(data.userId || '');
        setLoginStep('twoFactor');
        toast({
          title: "2FA erforderlich",
          description: "Bitte geben Sie Ihren 2FA-Code ein",
        });
      } else {
        localStorage.setItem('userId', data.id);
        localStorage.setItem('username', data.username);
        toast({
          title: "Erfolgreich angemeldet",
          description: `Willkommen zurück, ${data.username}!`,
        });
        setLocation('/');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message || 'Ungültige Anmeldedaten',
        variant: "destructive",
      });
    },
  });

  // 2FA verification mutation
  const verify2FAMutation = useMutation({
    mutationFn: async (token: string) => {
      return await apiRequest<{ id: string; username: string; email: string }>(
        'POST', 
        '/api/auth/verify-2fa', 
        { userId: pendingUserId, token }
      );
    },
    onSuccess: (data) => {
      localStorage.setItem('userId', data.id);
      localStorage.setItem('username', data.username);
      toast({
        title: "Erfolgreich angemeldet",
        description: `Willkommen zurück, ${data.username}!`,
      });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Verifizierung fehlgeschlagen",
        description: error.message || 'Ungültiger Code',
        variant: "destructive",
      });
    },
  });

  // WebAuthn login
  const webAuthnLogin = async () => {
    try {
      const email = getValues('email') || pendingEmail;
      if (!email) {
        toast({
          title: "E-Mail erforderlich",
          description: "Bitte geben Sie Ihre E-Mail-Adresse ein",
          variant: "destructive",
        });
        return;
      }

      const optionsResponse = await apiRequest<any>(
        'POST',
        '/api/auth/webauthn/login-options',
        { email }
      );

      const authResponse = await startAuthentication(optionsResponse);

      const verifyResponse = await apiRequest<{ id: string; username: string; email: string }>(
        'POST',
        '/api/auth/webauthn/login-verify',
        { userId: optionsResponse.userId, response: authResponse }
      );

      localStorage.setItem('userId', verifyResponse.id);
      localStorage.setItem('username', verifyResponse.username);
      toast({
        title: "Erfolgreich angemeldet",
        description: `Willkommen zurück, ${verifyResponse.username}!`,
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: "Passkey-Anmeldung fehlgeschlagen",
        description: error.message || 'Passkey konnte nicht verifiziert werden',
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: LoginForm) => {
    setPendingEmail(data.email);
    loginMutation.mutate(data);
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Accept both TOTP codes (6 digits) and backup codes (8 alphanumeric)
    if (twoFactorCode.length >= 6 && twoFactorCode.length <= 8) {
      verify2FAMutation.mutate(twoFactorCode);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#121212' }}
    >
      <Card className="w-full max-w-md" style={{ backgroundColor: '#181818' }}>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {loginStep === 'twoFactor' ? '2FA-Verifizierung' : 'Anmelden'}
          </CardTitle>
          <CardDescription className="text-center">
            {loginStep === 'twoFactor' 
              ? 'Geben Sie Ihren 6-stelligen 2FA-Code ein'
              : 'Melde dich mit deinem SoundVista-Konto an'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginStep === 'credentials' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="deine@email.de"
                  {...register('email')}
                  data-testid="input-email"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  data-testid="input-password"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                <SignIn size={20} weight="bold" className="mr-2" />
                {loginMutation.isPending ? 'Anmelden...' : 'Anmelden'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Oder</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={webAuthnLogin}
                data-testid="button-passkey-login"
              >
                <Fingerprint size={20} weight="bold" className="mr-2" />
                Mit Passkey anmelden
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Noch kein Konto?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation('/register')}
                  data-testid="button-go-to-register"
                >
                  <UserPlus size={20} weight="bold" className="mr-2" />
                  Jetzt registrieren
                </Button>
              </div>
            </form>
          )}

          {loginStep === 'twoFactor' && (
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twoFactorCode">2FA-Code oder Backup-Code</Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  placeholder="000000 oder ABCD1234"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoFocus
                  data-testid="input-2fa-code"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Gib deinen 6-stelligen Code aus der Authenticator-App ein<br />
                  oder verwende einen deiner 8-stelligen Backup-Codes
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={verify2FAMutation.isPending || twoFactorCode.length < 6}
                data-testid="button-verify-2fa"
              >
                <Shield size={20} weight="bold" className="mr-2" />
                {verify2FAMutation.isPending ? 'Verifizieren...' : 'Verifizieren'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setLoginStep('credentials');
                  setTwoFactorCode('');
                  setPendingUserId('');
                }}
                data-testid="button-back-to-login"
              >
                Zurück zur Anmeldung
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
