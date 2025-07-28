import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

export const WalletButton = () => {
  const { connected, disconnect, publicKey } = useWallet();

  if (!connected) {
    return <WalletMultiButton className="!bg-transparent !border-2 !border-primary !text-primary hover:!bg-primary hover:!text-primary-foreground !transition-smooth !rounded-md !px-6 !py-3 !font-medium" />;
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted">
        <Wallet className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {publicKey ? formatAddress(publicKey.toString()) : 'Connected'}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={disconnect}
        className="flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Disconnect
      </Button>
    </div>
  );
};