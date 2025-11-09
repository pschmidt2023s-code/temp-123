import { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface AdOverlayProps {
  tier: string;
  onAdComplete: () => void;
  onSkip?: () => void;
}

export function AdOverlay({ tier, onAdComplete, onSkip }: AdOverlayProps) {
  const [timeRemaining, setTimeRemaining] = useState(20);
  const canSkip = tier !== 'free';
  const adDuration = tier === 'free' ? 30 : 20;

  useEffect(() => {
    setTimeRemaining(adDuration);
    
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAdComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [adDuration, onAdComplete]);

  const handleSkip = () => {
    if (canSkip && onSkip) {
      onSkip();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        data-testid="ad-overlay"
      >
        <div className="glass rounded-2xl p-8 max-w-2xl w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/50 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-white">AD</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Werbepause</h2>
            <p className="text-muted-foreground">
              {tier === 'free' 
                ? 'Upgrade auf Plus für kürzere Werbeunterbrechungen'
                : 'Upgrade auf Premium für werbefreies Hören'}
            </p>
          </div>

          <div className="mb-6">
            <div className="text-6xl font-bold text-primary mb-2">
              {timeRemaining}s
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: adDuration, ease: 'linear' }}
              />
            </div>
          </div>

          {canSkip ? (
            <Button
              onClick={handleSkip}
              size="lg"
              className="w-full"
              data-testid="button-skip-ad"
            >
              <X className="mr-2" weight="bold" />
              Werbung überspringen
            </Button>
          ) : (
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Mit <span className="text-primary font-semibold">Plus</span> können Sie Werbung überspringen
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
