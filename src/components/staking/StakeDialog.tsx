import { Badge } from "@/components/ui/badge";
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
import { ArrowRight, Info, Zap } from "lucide-react";
import { useState } from "react";

interface StakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStake: (amount: number) => Promise<void>;
  poolName: string;
  maxAmount: number;
  apy: number;
  isLoading?: boolean;
}

export const StakeDialog = ({
  open,
  onOpenChange,
  onStake,
  poolName,
  maxAmount,
  apy,
  isLoading = false,
}: StakeDialogProps) => {
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [minPoolTokens, setMinPoolTokens] = useState<string>("");
  const [slippageWarning, setSlippageWarning] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const estimatedRewards = (numericAmount * apy) / 100;
  const poolTokensReceived = numericAmount * 0.95; // Assuming 5% fee for estimation
  const estimatedPoolTokens = poolTokensReceived;
  const minPoolTokensValue = parseFloat(minPoolTokens) || 0;
  // Slippage protection: warn if estimated output < minPoolTokens
  const isSlippage =
    minPoolTokensValue > 0 && estimatedPoolTokens < minPoolTokensValue;

  const handleStake = async () => {
    if (numericAmount > 0 && numericAmount <= maxAmount && !isSlippage) {
      setIsProcessing(true);
      try {
        // Optionally pass minPoolTokensValue to onStake if backend supports it
        await onStake(numericAmount /*, minPoolTokensValue */);
        setAmount("");
        setMinPoolTokens("");
        onOpenChange(false);
      } catch (error) {
        console.error("Staking failed:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const setMaxAmount = () => {
    setAmount(maxAmount.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Stake SOL
          </DialogTitle>
          <DialogDescription>
            Stake SOL in{" "}
            <span className="font-semibold text-foreground">{poolName}</span> to
            earn rewards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Stake</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16"
                max={maxAmount}
                min="0"
                step="0.01"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  SOL
                </span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Available: {maxAmount.toLocaleString()} SOL
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={setMaxAmount}
                className="h-auto p-0 text-primary hover:text-primary/80"
              >
                Max
              </Button>
            </div>
          </div>

          {/* Slippage Protection */}
          <div className="space-y-2">
            <Label htmlFor="minPoolTokens">
              Slippage Protection (optional)
            </Label>
            <Input
              id="minPoolTokens"
              type="number"
              placeholder="Minimum Pool Tokens to Receive"
              value={minPoolTokens}
              onChange={(e) => setMinPoolTokens(e.target.value)}
              min="0"
              step="0.01"
            />
            <div className="text-xs text-muted-foreground">
              If the estimated pool tokens received is less than this value,
              staking will be disabled and a warning will show.
            </div>
            {isSlippage && (
              <div className="text-xs text-red-500 font-medium">
                Warning: Estimated pool tokens (
                {estimatedPoolTokens.toLocaleString()}) is less than your
                minimum ({minPoolTokensValue.toLocaleString()}).
              </div>
            )}
          </div>

          {/* Staking Summary */}
          {numericAmount > 0 && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Info className="w-4 h-4 text-primary" />
                Staking Summary
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    You stake
                  </span>
                  <span className="font-medium">
                    {numericAmount.toLocaleString()} SOL
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    You receive
                  </span>
                  <span className="font-medium">
                    {poolTokensReceived.toLocaleString()} Pool Tokens
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Current APY
                  </span>
                  <Badge variant="secondary">{apy.toFixed(2)}%</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Est. yearly rewards
                  </span>
                  <span className="font-medium text-accent">
                    {estimatedRewards.toLocaleString()} SOL
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            variant="stake"
            size="lg"
            onClick={handleStake}
            disabled={
              !numericAmount ||
              numericAmount > maxAmount ||
              isProcessing ||
              isLoading ||
              isSlippage
            }
            className="w-full"
          >
            {isProcessing || isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Stake{" "}
                {numericAmount > 0 ? `${numericAmount.toLocaleString()} ` : ""}
                SOL
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
