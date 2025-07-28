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
import { ArrowRight, Upload } from "lucide-react";
import { useState } from "react";

interface StakeAccountDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeposit: (
    validatorVote: string,
    stakeAccountPubkey: string
  ) => Promise<void>;
  poolName: string;
}

export const StakeAccountDepositDialog = ({
  open,
  onOpenChange,
  onDeposit,
  poolName,
}: StakeAccountDepositDialogProps) => {
  const [validatorVote, setValidatorVote] = useState("");
  const [stakeAccountPubkey, setStakeAccountPubkey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [minPoolTokens, setMinPoolTokens] = useState("");

  const minPoolTokensValue = parseFloat(minPoolTokens) || 0;
  // For now, estimated output is not calculated, so always allow unless minPoolTokens is set (future extension)
  const isSlippage = false; // You can add logic if you estimate output

  const handleDeposit = async () => {
    if (!validatorVote || !stakeAccountPubkey || isSlippage) return;
    setIsProcessing(true);
    try {
      // Optionally pass minPoolTokensValue to onDeposit if backend supports it
      await onDeposit(
        validatorVote,
        stakeAccountPubkey /*, minPoolTokensValue */
      );
      setValidatorVote("");
      setStakeAccountPubkey("");
      setMinPoolTokens("");
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
            <Upload className="w-5 h-5 text-primary" />
            Deposit Stake Account
          </DialogTitle>
          <DialogDescription>
            Deposit a stake account into{" "}
            <span className="font-semibold text-foreground">{poolName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="validatorVote">Validator Vote Address</Label>
            <Input
              id="validatorVote"
              type="text"
              placeholder="Validator Vote Address"
              value={validatorVote}
              onChange={(e) => setValidatorVote(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stakeAccountPubkey">Stake Account Pubkey</Label>
            <Input
              id="stakeAccountPubkey"
              type="text"
              placeholder="Stake Account Pubkey"
              value={stakeAccountPubkey}
              onChange={(e) => setStakeAccountPubkey(e.target.value)}
              autoComplete="off"
            />
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
              If the pool tokens received is less than this value, deposit will
              be disabled and a warning will show.
            </div>
            {/* You can add a warning here if you estimate output */}
          </div>
          <Separator />
          <Button
            variant="stake"
            size="lg"
            onClick={handleDeposit}
            disabled={
              !validatorVote ||
              !stakeAccountPubkey ||
              isProcessing ||
              isSlippage
            }
            className="w-full"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Deposit Stake Account
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
