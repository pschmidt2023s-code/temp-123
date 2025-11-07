import { useState, useEffect } from 'react';
import { musicKit } from '@/lib/musickit';

export function useMKAuth() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    const mk = await musicKit.configure();
    if (mk) {
      const authorized = mk.isAuthorized;
      setIsAuthorized(authorized);
      if (authorized) {
        setUserToken(mk.musicUserToken);
      }
    }
  };

  const authorize = async () => {
    setIsLoading(true);
    try {
      const token = await musicKit.authorize();
      if (token) {
        setIsAuthorized(true);
        setUserToken(token);
        return token;
      }
    } catch (error) {
      console.error('Authorization failed:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  const unauthorize = async () => {
    const mk = musicKit.getInstance();
    if (mk) {
      await mk.unauthorize();
      setIsAuthorized(false);
      setUserToken(null);
    }
  };

  return {
    isAuthorized,
    isLoading,
    userToken,
    authorize,
    unauthorize,
  };
}
