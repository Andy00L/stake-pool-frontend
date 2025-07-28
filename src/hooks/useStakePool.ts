import { useToast } from "@/hooks/use-toast";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { useState } from "react";

export interface StakePoolData {
  address: string;
  name: string;
  apy: number;
  totalStaked: number;
  userStaked: number;
  validatorCount: number;
  poolTokenSupply: number;
  lastUpdateEpoch: number;
  status: "active" | "inactive";
  manager?: PublicKey;
  staker?: PublicKey;
  fee?: number;
  withdrawalFee?: number;
  depositFee?: number;
}

export const useStakePool = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Initialize a new stake pool (not typically done from frontend)
  const initializeStakePool = async (params: {
    fee: number;
    withdrawalFee: number;
    depositFee: number;
    maxValidators: number;
  }) => {
    toast({
      title: "Not Implemented",
      description:
        "Stake pool initialization should be done via CLI or admin tool.",
      variant: "destructive",
    });
    throw new Error(
      "Stake pool initialization is not implemented in frontend."
    );
  };

  // Deposit SOL and receive pool tokens
  const depositSol = async (stakePoolAddress: string, lamports: number) => {
    if (!publicKey) throw new Error("Wallet not connected");
    setLoading(true);
    try {
      const { depositSol, stakePoolInfo } = await import(
        "@solana/spl-stake-pool"
      );
      const stakePoolPubkey = new PublicKey(stakePoolAddress);

      // Fetch stake pool info to get pool mint
      const info = await stakePoolInfo(connection, stakePoolPubkey);
      const poolMint = new PublicKey(info.poolMint);

      // Get user's associated pool token account
      const userPoolTokenAccount = await getAssociatedTokenAddress(
        poolMint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Build deposit instructions
      const { instructions, signers } = await depositSol(
        connection,
        stakePoolPubkey,
        publicKey,
        lamports,
        userPoolTokenAccount
      );

      // Build and send transaction
      const tx = new Transaction();
      tx.add(...instructions);
      const signature = await sendTransaction(tx, connection, { signers });
      await connection.confirmTransaction(signature, "confirmed");

      toast({
        title: "SOL Deposited",
        description: `Successfully deposited ${
          lamports / LAMPORTS_PER_SOL
        } SOL`,
      });
      return signature;
    } catch (error) {
      console.error("Deposit failed:", error);
      toast({
        title: "Deposit Failed",
        description: "Failed to deposit SOL to stake pool",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Withdraw SOL by burning pool tokens
  const withdrawSol = async (
    stakePoolAddress: string,
    poolTokenAmount: number
  ) => {
    if (!publicKey) throw new Error("Wallet not connected");
    setLoading(true);
    try {
      const { withdrawSol, stakePoolInfo } = await import(
        "@solana/spl-stake-pool"
      );
      const stakePoolPubkey = new PublicKey(stakePoolAddress);
      const info = await stakePoolInfo(connection, stakePoolPubkey);
      const poolMint = new PublicKey(info.poolMint);
      const userPoolTokenAccount = await getAssociatedTokenAddress(
        poolMint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      // Withdraw SOL to user's wallet
      const { instructions, signers } = await withdrawSol(
        connection,
        stakePoolPubkey,
        publicKey,
        publicKey, // solReceiver
        poolTokenAmount
      );
      const tx = new Transaction();
      tx.add(...instructions);
      const signature = await sendTransaction(tx, connection, { signers });
      await connection.confirmTransaction(signature, "confirmed");
      toast({
        title: "SOL Withdrawn",
        description: `Successfully withdrew SOL from stake pool`,
      });
      return signature;
    } catch (error) {
      console.error("Withdraw failed:", error);
      toast({
        title: "Withdrawal Failed",
        description: "Failed to withdraw SOL from stake pool",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add validator to pool
  const addValidatorToPool = async (
    stakePoolAddress: string,
    voteAccount: string
  ) => {
    if (!publicKey) throw new Error("Wallet not connected");
    setLoading(true);
    try {
      const { addValidatorToPool } = await import("@solana/spl-stake-pool");
      const stakePoolPubkey = new PublicKey(stakePoolAddress);
      const votePubkey = new PublicKey(voteAccount);
      const { instructions } = await addValidatorToPool(
        connection,
        stakePoolPubkey,
        votePubkey
      );
      const tx = new Transaction();
      tx.add(...instructions);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");
      toast({
        title: "Validator Added",
        description: "Successfully added validator to stake pool",
      });
      return signature;
    } catch (error) {
      console.error("Add validator failed:", error);
      toast({
        title: "Add Validator Failed",
        description: "Failed to add validator to stake pool",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Remove validator from pool
  const removeValidatorFromPool = async (
    stakePoolAddress: string,
    voteAccount: string
  ) => {
    if (!publicKey) throw new Error("Wallet not connected");
    setLoading(true);
    try {
      const { removeValidatorFromPool } = await import(
        "@solana/spl-stake-pool"
      );
      const stakePoolPubkey = new PublicKey(stakePoolAddress);
      const votePubkey = new PublicKey(voteAccount);
      const { instructions } = await removeValidatorFromPool(
        connection,
        stakePoolPubkey,
        votePubkey
      );
      const tx = new Transaction();
      tx.add(...instructions);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");
      toast({
        title: "Validator Removed",
        description: "Successfully removed validator from stake pool",
      });
      return signature;
    } catch (error) {
      console.error("Remove validator failed:", error);
      toast({
        title: "Remove Validator Failed",
        description: "Failed to remove validator from stake pool",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update stake pool balance
  const updateStakePoolBalance = async (stakePoolAddress: string) => {
    if (!publicKey) throw new Error("Wallet not connected");
    setLoading(true);
    try {
      const { getStakePoolAccount, updateStakePool } = await import(
        "@solana/spl-stake-pool"
      );
      const stakePoolPubkey = new PublicKey(stakePoolAddress);
      const stakePoolAccount = await getStakePoolAccount(
        connection,
        stakePoolPubkey
      );
      const { updateListInstructions, finalInstructions } =
        await updateStakePool(connection, stakePoolAccount);
      const tx = new Transaction();
      tx.add(...updateListInstructions, ...finalInstructions);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");
      toast({
        title: "Balance Updated",
        description: "Successfully updated stake pool balance",
      });
      return signature;
    } catch (error) {
      console.error("Update balance failed:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update stake pool balance",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Deposit a stake account into the pool
  const depositStake = async (
    stakePoolAddress: string,
    validatorVote: string,
    depositStakePubkey: string
  ) => {
    if (!publicKey) throw new Error("Wallet not connected");
    setLoading(true);
    try {
      const { depositStake, stakePoolInfo } = await import(
        "@solana/spl-stake-pool"
      );
      const stakePoolPubkey = new PublicKey(stakePoolAddress);
      const votePubkey = new PublicKey(validatorVote);
      const depositStakeKey = new PublicKey(depositStakePubkey);
      const info = await stakePoolInfo(connection, stakePoolPubkey);
      const poolMint = new PublicKey(info.poolMint);
      const userPoolTokenAccount = await getAssociatedTokenAddress(
        poolMint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const { instructions, signers } = await depositStake(
        connection,
        stakePoolPubkey,
        publicKey,
        votePubkey,
        depositStakeKey,
        userPoolTokenAccount
      );
      const tx = new Transaction();
      tx.add(...instructions);
      const signature = await sendTransaction(tx, connection, { signers });
      await connection.confirmTransaction(signature, "confirmed");
      toast({
        title: "Stake Deposited",
        description: "Successfully deposited stake account to pool",
      });
      return signature;
    } catch (error) {
      console.error("Deposit stake failed:", error);
      toast({
        title: "Deposit Stake Failed",
        description: "Failed to deposit stake account to pool",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Withdraw a stake account from the pool
  const withdrawStake = async (
    stakePoolAddress: string,
    amount: number,
    voteAccount?: string
  ) => {
    if (!publicKey) throw new Error("Wallet not connected");
    setLoading(true);
    try {
      const { withdrawStake, stakePoolInfo } = await import(
        "@solana/spl-stake-pool"
      );
      const stakePoolPubkey = new PublicKey(stakePoolAddress);
      const info = await stakePoolInfo(connection, stakePoolPubkey);
      const poolMint = new PublicKey(info.poolMint);
      const userPoolTokenAccount = await getAssociatedTokenAddress(
        poolMint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      // Optionally withdraw from a specific validator
      const votePubkey = voteAccount ? new PublicKey(voteAccount) : undefined;
      const { instructions, signers } = await withdrawStake(
        connection,
        stakePoolPubkey,
        publicKey,
        amount,
        false, // useReserve
        votePubkey,
        undefined, // stakeReceiver (let program create)
        userPoolTokenAccount
      );
      const tx = new Transaction();
      tx.add(...instructions);
      const signature = await sendTransaction(tx, connection, { signers });
      await connection.confirmTransaction(signature, "confirmed");
      toast({
        title: "Stake Withdrawn",
        description: "Successfully withdrew stake from pool",
      });
      return signature;
    } catch (error) {
      console.error("Withdraw stake failed:", error);
      toast({
        title: "Withdraw Stake Failed",
        description: "Failed to withdraw stake from pool",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Slippage-protected functions are not available in the current @solana/spl-stake-pool JS SDK.
  // To implement slippage protection, check the expected output before/after the transaction
  // and warn/cancel if the result is below the user's threshold.
  // See: https://spl.solana.com/stake-pool for more details.

  return {
    loading,
    initializeStakePool,
    depositSol,
    withdrawSol,
    addValidatorToPool,
    removeValidatorFromPool,
    updateStakePoolBalance,
    depositStake,
    withdrawStake,
    // Slippage protection: implement in UI/client as needed
  };
};
