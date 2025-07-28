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
import { AlertTriangle, ArrowLeft, Clock } from "lucide-react";
import { useState } from "react";

interface UnstakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnstake: (amount: number) => Promise<void>;
  poolName: string;
  stakedAmount: number;
  poolTokenBalance: number;
  isLoading?: boolean;
}

export const UnstakeDialog = ({
  open,
  onOpenChange,
  onUnstake,
  poolName,
  stakedAmount,
  poolTokenBalance,
  isLoading = false,
}: UnstakeDialogProps) => {
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [minSol, setMinSol] = useState("");

  const numericAmount = parseFloat(amount) || 0;
  const solReceived = numericAmount * 1.05; // Assuming pool token value
  const unstakingFee = solReceived * 0.003; // 0.3% unstaking fee
  const netReceived = solReceived - unstakingFee;
  const minSolValue = parseFloat(minSol) || 0;
  const isSlippage = minSolValue > 0 && netReceived < minSolValue;

  const handleUnstake = async () => {
    if (numericAmount > 0 && numericAmount <= poolTokenBalance && !isSlippage) {
      setIsProcessing(true);
      try {
        // Optionally pass minSolValue to onUnstake if backend supports it
        await onUnstake(numericAmount /*, minSolValue */);
        setAmount("");
        setMinSol("");
        onOpenChange(false);
      } catch (error) {
        console.error("Unstaking failed:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const setMaxAmount = () => {
    setAmount(poolTokenBalance.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border/50 shadow-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-secondary" />
            Unstake from Pool
          </DialogTitle>
          <DialogDescription>
            Unstake your pool tokens from{" "}
            <span className="font-semibold text-foreground">{poolName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Unstaking Warning */}
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
              <AlertTriangle className="w-4 h-4" />
              Unstaking Notice
            </div>
            <div className="text-sm text-destructive/80 space-y-1">
              <p>• Unstaking may take 1-3 epochs to complete</p>
              <p>• A small fee applies to unstaking transactions</p>
              <p>• You'll stop earning rewards immediately</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Unstake (Pool Tokens)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16"
              max={poolTokenBalance}
              min="0"
              step="0.01"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Staked: {poolTokenBalance.toLocaleString()} Pool Tokens
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
            <Label htmlFor="minSol">Slippage Protection (optional)</Label>
            <Input
              id="minSol"
              type="number"
              placeholder="Minimum SOL to Receive"
              value={minSol}
              onChange={(e) => setMinSol(e.target.value)}
              min="0"
              step="0.01"
            />
            <div className="text-xs text-muted-foreground">
              If the estimated SOL received is less than this value, unstaking
              will be disabled and a warning will show.
            </div>
            {isSlippage && (
              <div className="text-xs text-red-500 font-medium">
                Warning: Estimated SOL received ({netReceived.toLocaleString()})
                is less than your minimum ({minSolValue.toLocaleString()}).
              </div>
            )}
          </div>

          {/* Unstaking Summary */}
          {numericAmount > 0 && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-secondary" />
                Unstaking Summary
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Pool tokens burned
                  </span>
                  <span className="font-medium">
                    {numericAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    SOL before fees
                  </span>
                  <span className="font-medium">
                    {solReceived.toLocaleString()} SOL
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Unstaking fee (0.3%)
                  </span>
                  <span className="font-medium text-destructive">
                    -{unstakingFee.toFixed(4)} SOL
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Net SOL received</span>
                  <span className="font-bold text-accent">
                    {netReceived.toLocaleString()} SOL
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                  <Clock className="w-3 h-3" />
                  Estimated processing time: 1-3 epochs (~2-6 days)
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            variant="stake"
            size="lg"
            onClick={handleUnstake}
            disabled={
              !numericAmount ||
              numericAmount > poolTokenBalance ||
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
                <ArrowLeft className="w-4 h-4" />
                Unstake{" "}
                {numericAmount > 0 ? `${numericAmount.toLocaleString()} ` : ""}
                Tokens
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
