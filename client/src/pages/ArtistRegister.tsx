import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MusicNotes, CheckCircle, XCircle, Clock } from '@phosphor-icons/react';
import type { ArtistRegistrationLink } from '@shared/schema';
import { motion } from 'framer-motion';

export default function ArtistRegister() {
  const [, params] = useRoute('/artist-register/:code');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const code = params?.code;

  const { data: link, isLoading, error } = useQuery<ArtistRegistrationLink>({
    queryKey: ['/api/artist-register/verify', code],
    queryFn: async () => {
      const res = await fetch(`/api/artist-register/verify/${code}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Link ungültig');
      }
      return res.json();
    },
    enabled: !!code,
    retry: false,
  });

  const register = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/artist-register', {
        ...data,
        registrationCode: code,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registrierung erfolgreich!",
        description: "Ihr Künstlerprofil wurde erstellt. Sie können sich jetzt anmelden.",
      });
      setTimeout(() => setLocation('/login'), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error.message || "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwörter stimmen nicht überein",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Passwort zu kurz",
        description: "Das Passwort muss mindestens 8 Zeichen lang sein",
        variant: "destructive",
      });
      return;
    }

    register.mutate({
      username,
      password,
      artistName: formData.get('artistName'),
      bio: formData.get('bio') || null,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212' }}>
        <Card className="w-full max-w-md glass">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Clock size={48} weight="bold" className="text-primary animate-pulse" />
              <p className="text-muted-foreground">Link wird überprüft...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#121212' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="w-full max-w-md glass">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle size={64} weight="bold" className="text-destructive" />
              </div>
              <CardTitle>Link ungültig</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : 'Dieser Registrierungslink ist nicht gültig oder abgelaufen.'}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setLocation('/login')}
                data-testid="button-back-to-login"
              >
                Zur Anmeldung
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (link.isUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#121212' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="w-full max-w-md glass">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle size={64} weight="bold" className="text-primary" />
              </div>
              <CardTitle>Link bereits verwendet</CardTitle>
              <CardDescription>
                Dieser Registrierungslink wurde bereits verwendet und kann nicht erneut genutzt werden.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setLocation('/login')}
                data-testid="button-back-to-login"
              >
                Zur Anmeldung
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  const isExpired = new Date() > new Date(link.expiresAt);
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#121212' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="w-full max-w-md glass">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Clock size={64} weight="bold" className="text-destructive" />
              </div>
              <CardTitle>Link abgelaufen</CardTitle>
              <CardDescription>
                Dieser Registrierungslink ist abgelaufen. Bitte kontaktieren Sie den Administrator für einen neuen Link.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setLocation('/login')}
                data-testid="button-back-to-login"
              >
                Zur Anmeldung
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#121212' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="glass">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <MusicNotes size={32} weight="bold" className="text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Künstler-Registrierung</CardTitle>
            <CardDescription>
              Erstellen Sie Ihr GlassBeats Künstlerprofil
            </CardDescription>
            {link.artistName && (
              <p className="text-sm text-primary mt-2">
                Willkommen, {link.artistName}!
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-artist-register">
              <div className="space-y-2">
                <Label htmlFor="artistName">
                  Künstlername <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="artistName"
                  name="artistName"
                  defaultValue={link.artistName || ''}
                  required
                  placeholder="z.B. Max Mustermann"
                  data-testid="input-artist-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Erzählen Sie etwas über sich..."
                  rows={3}
                  data-testid="input-bio"
                />
              </div>

              <div className="border-t border-border my-4" />

              <div className="space-y-2">
                <Label htmlFor="username">
                  Benutzername <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  required
                  placeholder="benutzername"
                  data-testid="input-username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Passwort <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Mindestens 8 Zeichen"
                  data-testid="input-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Passwort bestätigen <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Passwort wiederholen"
                  data-testid="input-confirm-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={register.isPending}
                data-testid="button-register"
              >
                {register.isPending ? 'Registriere...' : 'Profil erstellen'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center">
            <p className="text-xs text-muted-foreground">
              Bereits registriert?{' '}
              <button
                type="button"
                onClick={() => setLocation('/login')}
                className="text-primary hover:underline"
                data-testid="link-login"
              >
                Jetzt anmelden
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
