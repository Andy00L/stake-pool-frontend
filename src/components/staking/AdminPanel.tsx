import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useStakePool } from '@/hooks/useStakePool';
import { 
  Settings, 
  Plus, 
  Minus, 
  RefreshCw, 
  User, 
  DollarSign,
  Shield
} from 'lucide-react';

interface AdminPanelProps {
  stakePoolAddress: string;
  isManager: boolean;
}

export const AdminPanel = ({ stakePoolAddress, isManager }: AdminPanelProps) => {
  const { 
    loading,
    addValidatorToPool,
    removeValidatorFromPool,
    updateStakePoolBalance
  } = useStakePool();

  const [validatorVoteAccount, setValidatorVoteAccount] = useState('');
  const [validatorStakeAccount, setValidatorStakeAccount] = useState('');

  if (!isManager) {
    return (
      <Card className="shadow-card bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            Admin Panel
          </CardTitle>
          <CardDescription>
            You need manager permissions to access admin functions
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleAddValidator = async () => {
    if (!validatorVoteAccount.trim()) return;
    
    try {
      await addValidatorToPool(stakePoolAddress, validatorVoteAccount);
      setValidatorVoteAccount('');
    } catch (error) {
      console.error('Failed to add validator:', error);
    }
  };

  const handleRemoveValidator = async () => {
    if (!validatorStakeAccount.trim()) return;
    
    try {
      await removeValidatorFromPool(stakePoolAddress, validatorStakeAccount);
      setValidatorStakeAccount('');
    } catch (error) {
      console.error('Failed to remove validator:', error);
    }
  };

  const handleUpdateBalance = async () => {
    try {
      await updateStakePoolBalance(stakePoolAddress);
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  };

  return (
    <Card className="shadow-card bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Admin Panel
          <Badge variant="secondary">Manager</Badge>
        </CardTitle>
        <CardDescription>
          Manage validators and pool operations for {stakePoolAddress.slice(0, 8)}...
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pool Operations */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Pool Operations
          </h3>
          
          <Button
            variant="outline"
            onClick={handleUpdateBalance}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Updating...
              </div>
            ) : (
              <>Update Pool Balance</>
            )}
          </Button>
        </div>

        <Separator />

        {/* Add Validator */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Validator
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="vote-account">Validator Vote Account</Label>
            <Input
              id="vote-account"
              placeholder="Enter validator vote account address"
              value={validatorVoteAccount}
              onChange={(e) => setValidatorVoteAccount(e.target.value)}
            />
          </div>
          
          <Button
            variant="default"
            onClick={handleAddValidator}
            disabled={!validatorVoteAccount.trim() || loading}
            className="w-full"
          >
            Add Validator to Pool
          </Button>
        </div>

        <Separator />

        {/* Remove Validator */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Minus className="w-4 h-4" />
            Remove Validator
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="stake-account">Validator Stake Account</Label>
            <Input
              id="stake-account"
              placeholder="Enter validator stake account address"
              value={validatorStakeAccount}
              onChange={(e) => setValidatorStakeAccount(e.target.value)}
            />
          </div>
          
          <Button
            variant="destructive"
            onClick={handleRemoveValidator}
            disabled={!validatorStakeAccount.trim() || loading}
            className="w-full"
          >
            Remove Validator from Pool
          </Button>
        </div>

        <Separator />

        {/* Pool Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4" />
            Pool Information
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Pool Address</p>
              <p className="font-mono">{stakePoolAddress.slice(0, 12)}...</p>
            </div>
            <div>
              <p className="text-muted-foreground">Your Role</p>
              <Badge variant="secondary">Manager</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};