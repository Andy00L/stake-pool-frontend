// src/hooks/useStakePool.ts
// -----------------------------------------------------------------------------
// Stateless React hook that wires the Stake‑Pool Dashboard UI to the on‑chain
// SPL‑Stake‑Pool program. Every public method returns the confirmed tx signature
// so callers can surface it in the UI / explorer links.
// -----------------------------------------------------------------------------
import { useToast } from "@/hooks/use-toast";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { useCallback, useState } from "react";
import {
  addValidatorToPool as splAddValidatorToPool,
  removeValidatorFromPool as splRemoveValidatorFromPool,
  depositSol as splDepositSol,
  withdrawSol as splWithdrawSol,
  depositStake as splDepositStake,
  withdrawStake as splWithdrawStake,
  updateStakePool,
  getStakePoolAccount,
  stakePoolInfo,
} from "@solana/spl-stake-pool";
// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export interface StakePoolApi {
  depositSol(pool: string, lamports: number): Promise<string>;
  withdrawSol(pool: string, poolTokens: number): Promise<string>;
  depositStake(
    pool: string,
    voteAcc: string,
    stakeAcc: string
  ): Promise<string>;
  withdrawStake(
    pool: string,
    amount: number,
    voteAcc?: string
  ): Promise<string>;
  addValidatorToPool(pool: string, voteAcc: string): Promise<string>;
  removeValidatorFromPool(pool: string, voteAcc: string): Promise<string>;
  updateStakePoolBalance(pool: string): Promise<string>;
  loading: boolean;
}
// -----------------------------------------------------------------------------
// Shared helper to send & confirm a transaction
// -----------------------------------------------------------------------------
async function sendAndConfirm(
  connection: ReturnType<typeof useConnection>["connection"],
  walletSend: ReturnType<typeof useWallet>["sendTransaction"],
  tx: Transaction | VersionedTransaction,
  signers: Parameters<
    ReturnType<typeof useWallet>["sendTransaction"]
  >[2]["signers"] = []
) {
  const sig = await walletSend(tx, connection, { signers });
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}
// -----------------------------------------------------------------------------
// Hook implementation
// -----------------------------------------------------------------------------
export const useStakePool = (): StakePoolApi => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  // Helper to ensure wallet is connected
  const requireWallet = useCallback(() => {
    if (!publicKey) {
      throw new Error("Wallet not connected");
    }
    return publicKey;
  }, [publicKey]);
  // ---------------------------------------------------------------------------
  // depositSol
  // ---------------------------------------------------------------------------
  const depositSol = useCallback<StakePoolApi["depositSol"]>(
    async (pool, lamports) => {
      const user = requireWallet();
      setLoading(true);
      try {
        const poolPk = new PublicKey(pool);
        const { poolMint } = await stakePoolInfo(connection, poolPk);
        // --- Ensure correct parameter order and types for getAssociatedTokenAddressSync ---
        // --- Reverted bigint conversion: Pass lamports as number ---
        const ata = getAssociatedTokenAddressSync(
          new PublicKey(poolMint), // mint: PublicKey
          user, // owner: PublicKey
          false, // allowOwnerOffCurve: boolean
          TOKEN_PROGRAM_ID, // programId: PublicKey
          ASSOCIATED_TOKEN_PROGRAM_ID // associatedTokenProgramId: PublicKey
        );
        // --- Pass lamports directly as number ---
        const { instructions, signers } = await splDepositSol(
          connection,
          poolPk,
          user, // stakePoolAuthority / depositor: PublicKey
          lamports, // amount: number
          ata // tokenAccount: PublicKey
        );
        const tx = new Transaction().add(...instructions);
        const sig = await sendAndConfirm(
          connection,
          sendTransaction,
          tx,
          signers
        );
        toast({
          title: "Deposited SOL",
          description: `Deposited ${(lamports / LAMPORTS_PER_SOL).toFixed(
            2
          )} SOL`,
        });
        return sig;
      } catch (err) {
        console.error(err);
        toast({
          title: "Deposit failed",
          description: (err as Error).message ?? "Unknown error",
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connection, requireWallet, sendTransaction, toast]
  );
  // ---------------------------------------------------------------------------
  // withdrawSol
  // ---------------------------------------------------------------------------
  const withdrawSol = useCallback<StakePoolApi["withdrawSol"]>(
    async (pool, poolTokens) => {
      const user = requireWallet();
      setLoading(true);
      try {
        const poolPk = new PublicKey(pool);
        const { poolMint } = await stakePoolInfo(connection, poolPk);
        // --- Ensure correct parameter order and types for getAssociatedTokenAddressSync ---
        // --- Reverted bigint conversion: Pass poolTokens as number ---
        const ata = getAssociatedTokenAddressSync(
          new PublicKey(poolMint), // mint: PublicKey
          user, // owner: PublicKey
          false, // allowOwnerOffCurve: boolean
          TOKEN_PROGRAM_ID, // programId: PublicKey
          ASSOCIATED_TOKEN_PROGRAM_ID // associatedTokenProgramId: PublicKey
        );
        // --- Pass poolTokens directly as number ---
        const { instructions, signers } = await splWithdrawSol(
          connection,
          poolPk,
          user, // stakePoolAuthority / withdrawer: PublicKey
          user, // solReceiver: PublicKey
          poolTokens, // poolTokens: number
          ata // tokenAccount: PublicKey
        );
        const tx = new Transaction().add(...instructions);
        const sig = await sendAndConfirm(
          connection,
          sendTransaction,
          tx,
          signers
        );
        toast({
          title: "Withdrew SOL",
          description: "Pool tokens burned for SOL",
        });
        return sig;
      } catch (err) {
        console.error(err);
        toast({
          title: "Withdrawal failed",
          description: (err as Error).message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connection, requireWallet, sendTransaction, toast]
  );
  // ---------------------------------------------------------------------------
  // depositStake
  // ---------------------------------------------------------------------------
  const depositStake = useCallback<StakePoolApi["depositStake"]>(
    async (pool, voteAcc, stakeAcc) => {
      const user = requireWallet();
      setLoading(true);
      try {
        const poolPk = new PublicKey(pool);
        const votePk = new PublicKey(voteAcc);
        const stakePk = new PublicKey(stakeAcc);
        const { poolMint } = await stakePoolInfo(connection, poolPk);
        // --- Ensure correct parameter order and types for getAssociatedTokenAddressSync ---
        const ata = getAssociatedTokenAddressSync(
          new PublicKey(poolMint), // mint: PublicKey
          user, // owner: PublicKey
          false, // allowOwnerOffCurve: boolean
          TOKEN_PROGRAM_ID, // programId: PublicKey
          ASSOCIATED_TOKEN_PROGRAM_ID // associatedTokenProgramId: PublicKey
        );
        // --- Ensure PublicKey parameters are passed correctly ---
        const { instructions, signers } = await splDepositStake(
          connection,
          poolPk, // stakePoolAddress: PublicKey
          user, // stakePoolAuthority / depositor: PublicKey
          votePk, // validatorVote: PublicKey
          stakePk, // stakeAccount: PublicKey
          ata // tokenAccount: PublicKey
        );
        const sig = await sendAndConfirm(
          connection,
          sendTransaction,
          new Transaction().add(...instructions),
          signers
        );
        toast({
          title: "Deposited stake",
          description: "Stake account merged into pool",
        });
        return sig;
      } catch (err) {
        console.error(err);
        toast({
          title: "Deposit stake failed",
          description: (err as Error).message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connection, requireWallet, sendTransaction, toast]
  );
  // ---------------------------------------------------------------------------
  // withdrawStake
  // ---------------------------------------------------------------------------
  const withdrawStake = useCallback<StakePoolApi["withdrawStake"]>(
    async (pool, amount, voteAcc) => {
      const user = requireWallet();
      setLoading(true);
      try {
        const poolPk = new PublicKey(pool);
        const { poolMint } = await stakePoolInfo(connection, poolPk);
        // --- Ensure correct parameter order and types for getAssociatedTokenAddressSync ---
        // --- Reverted bigint conversion: Pass amount as number ---
        const ata = getAssociatedTokenAddressSync(
          new PublicKey(poolMint), // mint: PublicKey
          user, // owner: PublicKey
          false, // allowOwnerOffCurve: boolean
          TOKEN_PROGRAM_ID, // programId: PublicKey
          ASSOCIATED_TOKEN_PROGRAM_ID // associatedTokenProgramId: PublicKey
        );
        // --- Pass amount directly as number ---
        const votePk = voteAcc ? new PublicKey(voteAcc) : undefined; // Optional validatorVote
        const { instructions, signers } = await splWithdrawStake(
          connection,
          poolPk, // stakePoolAddress: PublicKey
          user, // stakePoolAuthority / withdrawer: PublicKey
          amount, // amount: number
          ata, // tokenAccount: PublicKey
          votePk // validatorVote (optional): PublicKey | undefined
        );
        const sig = await sendAndConfirm(
          connection,
          sendTransaction,
          new Transaction().add(...instructions),
          signers
        );
        toast({
          title: "Withdrew stake",
          description: "Stake account withdrawn from pool",
        });
        return sig;
      } catch (err) {
        console.error(err);
        toast({
          title: "Withdraw stake failed",
          description: (err as Error).message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connection, requireWallet, sendTransaction, toast]
  );
  // ---------------------------------------------------------------------------
  // addValidatorToPool
  // ---------------------------------------------------------------------------
  const addValidatorToPool = useCallback<StakePoolApi["addValidatorToPool"]>(
    async (pool, voteAcc) => {
      const user = requireWallet(); // manager
      setLoading(true);
      try {
        const poolPk = new PublicKey(pool);
        const votePk = new PublicKey(voteAcc);
        // --- Ensure PublicKey parameters are passed correctly ---
        const { instructions } = await splAddValidatorToPool(
          connection,
          poolPk, // stakePoolAddress: PublicKey
          votePk, // validatorVote: PublicKey
          user // stakePoolAuthority (manager): PublicKey
        );
        const sig = await sendAndConfirm(
          connection,
          sendTransaction,
          new Transaction().add(...instructions)
        );
        toast({ title: "Validator added", description: votePk.toBase58() });
        return sig;
      } catch (err) {
        console.error(err);
        toast({
          title: "Add validator failed",
          description: (err as Error).message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connection, requireWallet, sendTransaction, toast]
  );
  // ---------------------------------------------------------------------------
  // removeValidatorFromPool
  // ---------------------------------------------------------------------------
  const removeValidatorFromPool = useCallback<
    StakePoolApi["removeValidatorFromPool"]
  >(
    async (pool, voteAcc) => {
      const user = requireWallet();
      setLoading(true);
      try {
        const poolPk = new PublicKey(pool);
        const votePk = new PublicKey(voteAcc);
        // --- Ensure PublicKey parameters are passed correctly ---
        const { instructions } = await splRemoveValidatorFromPool(
          connection,
          poolPk, // stakePoolAddress: PublicKey
          votePk, // validatorVote: PublicKey
          user // stakePoolAuthority (manager): PublicKey
        );
        const sig = await sendAndConfirm(
          connection,
          sendTransaction,
          new Transaction().add(...instructions)
        );
        toast({ title: "Validator removed", description: votePk.toBase58() });
        return sig;
      } catch (err) {
        console.error(err);
        toast({
          title: "Remove validator failed",
          description: (err as Error).message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connection, requireWallet, sendTransaction, toast]
  );
  // ---------------------------------------------------------------------------
  // updateStakePoolBalance
  // ---------------------------------------------------------------------------
  const updateStakePoolBalance = useCallback<
    StakePoolApi["updateStakePoolBalance"]
  >(
    async (pool) => {
      const user = requireWallet();
      setLoading(true);
      try {
        const poolPk = new PublicKey(pool);
        const stakePoolAcct = await getStakePoolAccount(connection, poolPk);
        // --- Ensure PublicKey parameters are passed correctly ---
        const { updateListInstructions, finalInstructions } =
          await updateStakePool(
            connection,
            stakePoolAcct, // stakePool: StakePoolAccount
            user // stakePoolAuthority: PublicKey
          );
        const tx = new Transaction().add(
          ...updateListInstructions,
          ...finalInstructions
        );
        const sig = await sendAndConfirm(connection, sendTransaction, tx);
        toast({ title: "Pool balance updated" });
        return sig;
      } catch (err) {
        console.error(err);
        toast({
          title: "Update failed",
          description: (err as Error).message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connection, requireWallet, sendTransaction, toast]
  );
  // expose API
  return {
    loading,
    depositSol,
    withdrawSol,
    depositStake,
    withdrawStake,
    addValidatorToPool,
    removeValidatorFromPool,
    updateStakePoolBalance,
  };
};
