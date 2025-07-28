import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { StakePoolData, useStakePool } from "@/hooks/useStakePool";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  AlertCircle,
  Coins,
  Percent,
  RefreshCw,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { WalletButton } from "../wallet/WalletButton";
import { AdminPanel } from "./AdminPanel";
import { StakeAccountDepositDialog } from "./StakeAccountDepositDialog";
import { StakeAccountWithdrawDialog } from "./StakeAccountWithdrawDialog";
import { StakeDialog } from "./StakeDialog";
import { StakePoolCard } from "./StakePoolCard";
import { UnstakeDialog } from "./UnstakeDialog";

export const StakingDashboard = () => {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  const {
    loading: stakePoolLoading,
    depositSol,
    withdrawSol,
    depositStake,
    withdrawStake,
  } = useStakePool();

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [stakePools, setStakePools] = useState<StakePoolData[]>([]);
  const [selectedPool, setSelectedPool] = useState<StakePoolData | null>(null);
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [unstakeDialogOpen, setUnstakeDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stakeAccountDepositDialogOpen, setStakeAccountDepositDialogOpen] =
    useState(false);
  const [stakeAccountWithdrawDialogOpen, setStakeAccountWithdrawDialogOpen] =
    useState(false);
  const [selectedStakeAccount, setSelectedStakeAccount] = useState<
    string | null
  >(null);
  const [stakeAccountAmount, setStakeAccountAmount] = useState<number>(0);

  // Mock data for demonstration
  useEffect(() => {
    if (connected) {
      // Simulate fetching stake pools
      setStakePools([
        {
          address: "CCtTHhMp2s46pXaH5xoSjx3AjGNVfvuLrCBLEHUgLqS2",
          name: "Marinade Native Pool",
          apy: 6.8,
          totalStaked: 1250000,
          userStaked: 150,
          validatorCount: 24,
          poolTokenSupply: 2000000,
          lastUpdateEpoch: 485,
          status: "active",
        },
        {
          address: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
          name: "Jito Liquid Staking Pool",
          apy: 7.2,
          totalStaked: 980000,
          userStaked: 0,
          validatorCount: 18,
          poolTokenSupply: 1500000,
          lastUpdateEpoch: 485,
          status: "active",
        },
        {
          address: "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby",
          name: "Lido wstSOL Pool",
          apy: 6.5,
          totalStaked: 2100000,
          userStaked: 75,
          validatorCount: 32,
          poolTokenSupply: 3200000,
          lastUpdateEpoch: 484,
          status: "active",
        },
      ]);
    }
  }, [connected]);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey && connection) {
        try {
          const balance = await connection.getBalance(publicKey);
          setWalletBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    fetchBalance();
  }, [connected, publicKey, connection]);

  const handleStake = async (amount: number) => {
    if (!selectedPool || !connected) return;

    try {
      const lamports = amount * LAMPORTS_PER_SOL;
      await depositSol(selectedPool.address, lamports);

      // Update pool data
      setStakePools((prev) =>
        prev.map((pool) =>
          pool.address === selectedPool.address
            ? {
                ...pool,
                userStaked: pool.userStaked + amount,
                totalStaked: pool.totalStaked + amount,
              }
            : pool
        )
      );

      // Update wallet balance
      setWalletBalance((prev) => prev - amount);
      setStakeDialogOpen(false);
    } catch (error) {
      console.error("Staking failed:", error);
    }
  };

  const handleUnstake = async (amount: number) => {
    if (!selectedPool || !connected) return;

    try {
      await withdrawSol(selectedPool.address, amount);

      const solAmount = amount * 1.05; // Pool token to SOL conversion

      // Update pool data
      setStakePools((prev) =>
        prev.map((pool) =>
          pool.address === selectedPool.address
            ? { ...pool, userStaked: Math.max(0, pool.userStaked - solAmount) }
            : pool
        )
      );

      setUnstakeDialogOpen(false);
    } catch (error) {
      console.error("Unstaking failed:", error);
    }
  };

  // Handler for stake account deposit
  const handleStakeAccountDeposit = async (
    validatorVote: string,
    stakeAccountPubkey: string
  ) => {
    if (!selectedPool || !connected) return;
    try {
      // You may want to let user specify amount, but for now use full stake account
      await depositStake(
        selectedPool.address,
        validatorVote,
        stakeAccountPubkey
      );
      setStakeAccountDepositDialogOpen(false);
    } catch (error) {
      console.error("Stake account deposit failed:", error);
    }
  };

  // Handler for stake account withdraw
  const handleStakeAccountWithdraw = async (
    amount: number,
    voteAccount?: string
  ) => {
    if (!selectedPool || !connected) return;
    try {
      await withdrawStake(selectedPool.address, amount, voteAccount);
      setStakeAccountWithdrawDialogOpen(false);
    } catch (error) {
      console.error("Stake account withdraw failed:", error);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const totalStaked = stakePools.reduce(
    (sum, pool) => sum + pool.userStaked,
    0
  );
  const averageAPY =
    stakePools.length > 0
      ? stakePools.reduce((sum, pool) => sum + pool.apy, 0) / stakePools.length
      : 0;

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full shadow-card bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="w-6 h-6 text-primary" />
              Connect Your Wallet
            </CardTitle>
            <CardDescription>
              Connect your Solana wallet to start staking and earning rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
            Stake Pool Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Stake your SOL and earn rewards through decentralized stake pools
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <WalletButton />
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {walletBalance.toLocaleString()} SOL
            </div>
            <p className="text-xs text-muted-foreground">Available to stake</p>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="w-4 h-4 text-accent" />
              Total Staked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {totalStaked.toLocaleString()} SOL
            </div>
            <p className="text-xs text-muted-foreground">Across all pools</p>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="w-4 h-4 text-secondary" />
              Average APY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {averageAPY.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">Weighted average</p>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Est. Yearly Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {((totalStaked * averageAPY) / 100).toFixed(2)} SOL
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current APY
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pools" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="pools">Stake Pools</TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Admin
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Available Stake Pools</h2>
            <Badge variant="secondary" className="flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              {
                stakePools.filter((pool) => pool.status === "active").length
              }{" "}
              Active Pools
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {stakePools.map((pool) => (
              <StakePoolCard
                key={pool.address}
                pool={pool}
                onStake={() => {
                  setSelectedPool(pool);
                  setStakeDialogOpen(true);
                }}
                onUnstake={() => {
                  setSelectedPool(pool);
                  setUnstakeDialogOpen(true);
                }}
                onStakeAccountDeposit={() => {
                  setSelectedPool(pool);
                  setStakeAccountDepositDialogOpen(true);
                }}
                onStakeAccountWithdraw={() => {
                  setSelectedPool(pool);
                  setStakeAccountWithdrawDialogOpen(true);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <div className="grid gap-6">
            {stakePools.map((pool) => (
              <AdminPanel
                key={pool.address}
                stakePoolAddress={pool.address}
                isManager={pool.manager?.toString() === publicKey?.toString()}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <>
        <StakeDialog
          open={stakeDialogOpen}
          onOpenChange={setStakeDialogOpen}
          onStake={handleStake}
          poolName={selectedPool?.name || ""}
          maxAmount={walletBalance}
          apy={selectedPool?.apy || 0}
          isLoading={stakePoolLoading}
        />
        <UnstakeDialog
          open={unstakeDialogOpen}
          onOpenChange={setUnstakeDialogOpen}
          onUnstake={handleUnstake}
          poolName={selectedPool?.name || ""}
          stakedAmount={selectedPool?.userStaked || 0}
          poolTokenBalance={
            selectedPool?.userStaked ? selectedPool.userStaked * 0.95 : 0
          }
          isLoading={stakePoolLoading}
        />
        <StakeAccountDepositDialog
          open={stakeAccountDepositDialogOpen}
          onOpenChange={setStakeAccountDepositDialogOpen}
          onDeposit={handleStakeAccountDeposit}
          poolName={selectedPool?.name || ""}
        />
        <StakeAccountWithdrawDialog
          open={stakeAccountWithdrawDialogOpen}
          onOpenChange={setStakeAccountWithdrawDialogOpen}
          onWithdraw={handleStakeAccountWithdraw}
          poolName={selectedPool?.name || ""}
        />
      </>
    </div>
  );
};
