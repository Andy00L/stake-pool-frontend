import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, DollarSign, Calendar, Percent } from "lucide-react";

interface StakePoolCardProps {
  pool: {
    name: string;
    apy: number;
    totalStaked: number;
    userStaked: number;
    validatorCount: number;
    poolTokenSupply: number;
    lastUpdateEpoch: number;
    status: "active" | "inactive";
  };
  onStake: () => void;
  onUnstake: () => void;
  onStakeAccountDeposit?: () => void;
  onStakeAccountWithdraw?: () => void;
}

export const StakePoolCard = ({
  pool,
  onStake,
  onUnstake,
}: StakePoolCardProps) => {
  const utilizationRate = (pool.totalStaked / pool.poolTokenSupply) * 100;

  return (
    <Card className="shadow-card bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-glow transition-smooth">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {pool.name}
              <Badge
                variant={pool.status === "active" ? "default" : "secondary"}
              >
                {pool.status}
              </Badge>
            </CardTitle>
            <CardDescription>Solana Stake Pool</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary flex items-center gap-1">
              <Percent className="w-5 h-5" />
              {pool.apy.toFixed(2)}%
            </div>
            <p className="text-sm text-muted-foreground">APY</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pool Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              Total Staked
            </div>
            <p className="text-lg font-semibold">
              {pool.totalStaked.toLocaleString()} SOL
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              Validators
            </div>
            <p className="text-lg font-semibold">{pool.validatorCount}</p>
          </div>
        </div>

        {/* User's Stake */}
        {pool.userStaked > 0 && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-sm text-primary mb-2">
              <TrendingUp className="w-4 h-4" />
              Your Stake
            </div>
            <p className="text-xl font-bold text-primary">
              {pool.userStaked.toLocaleString()} SOL
            </p>
          </div>
        )}

        {/* Pool Utilization */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pool Utilization</span>
            <span className="font-medium">{utilizationRate.toFixed(1)}%</span>
          </div>
          <Progress value={utilizationRate} className="h-2" />
        </div>

        {/* Last Update */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          Last updated: Epoch {pool.lastUpdateEpoch}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="stake"
            className="flex-1"
            onClick={onStake}
            disabled={pool.status !== "active"}
          >
            Stake SOL
          </Button>
          {pool.userStaked > 0 && (
            <Button variant="unstake" className="flex-1" onClick={onUnstake}>
              Unstake
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
