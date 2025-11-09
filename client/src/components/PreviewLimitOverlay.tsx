import { Button } from '@/components/ui/button';
import { CrownSimple } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface PreviewLimitOverlayProps {
  onUpgrade: () => void;
}

export function PreviewLimitOverlay({ onUpgrade }: PreviewLimitOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      data-testid="preview-limit-overlay"
    >
      <div className="glass rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-yellow-500 rounded-full flex items-center justify-center mb-6">
          <CrownSimple size={48} weight="fill" className="text-white" />
        </div>
        
        <h2 className="text-3xl font-bold mb-3">30s Preview beendet</h2>
        <p className="text-muted-foreground mb-6">
          Upgrade auf <span className="text-primary font-semibold">Plus</span> oder höher für unbegrenztes Streaming
        </p>

        <div className="space-y-3">
          <Button
            onClick={onUpgrade}
            size="lg"
            className="w-full"
            data-testid="button-upgrade-preview"
          >
            <CrownSimple className="mr-2" weight="fill" />
            Jetzt upgraden
          </Button>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="glass rounded-lg p-2">
              <div className="font-semibold text-primary">Plus</div>
              <div className="text-muted-foreground">€4.99/mo</div>
            </div>
            <div className="glass rounded-lg p-2">
              <div className="font-semibold text-primary">Premium</div>
              <div className="text-muted-foreground">€9.99/mo</div>
            </div>
            <div className="glass rounded-lg p-2">
              <div className="font-semibold text-primary">Family</div>
              <div className="text-muted-foreground">€14.99/mo</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
