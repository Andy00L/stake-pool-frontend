import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Download } from "lucide-react";
import { useState } from "react";

interface StakeAccountWithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWithdraw: (amount: number, voteAccount?: string) => Promise<void>;
  poolName: string;
}

export const StakeAccountWithdrawDialog = ({
  open,
  onOpenChange,
  onWithdraw,
  poolName,
}: StakeAccountWithdrawDialogProps) => {
  const [amount, setAmount] = useState("");
  const [voteAccount, setVoteAccount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [minStake, setMinStake] = useState("");

  const numericAmount = parseFloat(amount) || 0;
  const minStakeValue = parseFloat(minStake) || 0;
  // For now, estimated output is not calculated, so always allow unless minStake is set (future extension)
  const isSlippage = false; // You can add logic if you estimate output

  const handleWithdraw = async () => {
    if (!numericAmount || isSlippage) return;
    setIsProcessing(true);
    try {
      // Optionally pass minStakeValue to onWithdraw if backend supports it
      await onWithdraw(
        numericAmount,
        voteAccount || undefined /*, minStakeValue */
      );
      setAmount("");
      setVoteAccount("");
      setMinStake("");
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Withdraw Stake Account
          </DialogTitle>
          <DialogDescription>
            Withdraw a stake account from{" "}
            <span className="font-semibold text-foreground">{poolName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Pool Tokens)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voteAccount">
              Validator Vote Address (optional)
            </Label>
            <Input
              id="voteAccount"
              type="text"
              placeholder="Validator Vote Address"
              value={voteAccount}
              onChange={(e) => setVoteAccount(e.target.value)}
              autoComplete="off"
            />
          </div>
          {/* Slippage Protection */}
          <div className="space-y-2">
            <Label htmlFor="minStake">Slippage Protection (optional)</Label>
            <Input
              id="minStake"
              type="number"
              placeholder="Minimum Stake to Receive"
              value={minStake}
              onChange={(e) => setMinStake(e.target.value)}
              min="0"
              step="0.01"
            />
            <div className="text-xs text-muted-foreground">
              If the stake received is less than this value, withdrawal will be
              disabled and a warning will show.
            </div>
            {/* You can add a warning here if you estimate output */}
          </div>
          <Separator />
          <Button
            variant="stake"
            size="lg"
            onClick={handleWithdraw}
            disabled={!numericAmount || isProcessing || isSlippage}
            className="w-full"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Withdraw Stake Account
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
