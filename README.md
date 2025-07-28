# Stake Pool Dashboard

A lean, production‑ready front‑end for the **Stake Pool** template generated with [Codigo.ai](https://codigo.ai). It lets any Solana user connect a wallet, discover stake pools, and stake or unstake in a few clicks.

---

## 1 · Prerequisites

- **Node 18+** and **npm 9+** (or pnpm / yarn)
- A Solana wallet (Phantom, Solflare…)

```bash
# Clone & install
git clone https://github.com/<your‑org>/<repo>.git
cd stake‑pool‑dashboard
npm i

# Configure env (see §4)
# Start dev server
npm run dev    # → http://localhost:5173
```

---

## 2 · Tech Stack

| Layer   | Lib                                              | Rationale                               |
| ------- | ------------------------------------------------ | --------------------------------------- |
| Build   | **Vite**                                         | Fast HMR & zero‑config TS/React         |
| Runtime | **React 18 + TypeScript 5**                      | Modern, strongly‑typed UI               |
| Styling | **Tailwind CSS** + **shadcn‑ui**                 | Utility classes & accessible components |
| Solana  | **@solana/web3.js** + **@solana/wallet‑adapter** | Cluster RPC + multi‑wallet modal        |
| State   | **TanStack Query**                               | Declarative async & caching             |

---

## 3 · Scripts

| Script            | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Vite dev server with HMR              |
| `npm run build`   | Optimised production build in `dist/` |
| `npm run preview` | Serves the build locally              |
| `npm run lint`    | ESLint (+ Prettier if configured)     |

---

## 4 · Environment

Create `.env.local` in the project root:

```dotenv
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
VITE_STAKE_POOL_PROGRAM_ID=<stake_pool_program_id>
```

| Var                          | Default    | Purpose                        |
| ---------------------------- | ---------- | ------------------------------ |
| `VITE_RPC_ENDPOINT`          | devnet RPC | RPC node URL                   |
| `VITE_STAKE_POOL_PROGRAM_ID` |  —         | On‑chain Stake Pool program id |

---

## 5 · Project Layout

```
src/
├─ components/         # UI atoms & feature dialogs
├─ hooks/              # e.g. useStakePool.ts (replace mocks)
├─ contexts/           # WalletProvider
├─ pages/              # Route components
├─ App.tsx             # Providers + Router
└─ main.tsx            # Vite entrypoint
```

---

## 6 · How It Works

1. **Wallet connect** – `WalletContext` exposes the connected keypair to the app.
2. **Data fetch** – `useStakePool()` pulls pool metadata & user positions via RPC.
3. **Stake / Unstake** – Modal dialogs validate input then call hook actions:

```ts
interface StakePoolApi {
  depositSol(poolId: string, lamports: number): Promise<void>;
  withdrawSol(poolId: string, poolTokens: number): Promise<void>;
  depositStake(
    poolId: string,
    voteAcc: string,
    stakeAcc: string
  ): Promise<void>;
  withdrawStake(
    poolId: string,
    amount: number,
    voteAcc?: string
  ): Promise<void>;
}
```

Replace the stubbed logic in `hooks/useStakePool.ts` with Anchor or raw `@solana/web3.js` instructions.
4\. **Admin panel** (visible to pool manager) lets you add/remove validators and rebalance.

---

## 7 · Deployment

| Target               | Steps                                |
| -------------------- | ------------------------------------ |
| **Vercel**           | `vercel` • set env vars in dashboard |
| **Netlify**          | `netlify deploy` → publish `dist/`   |
| **Cloudflare Pages** | `wrangler pages deploy dist`         |

---

## 8 · Contributing

```bash
git checkout -b feat/awesome
npm run lint && npm run test   # if tests present
git commit -m "feat: awesome"
open PR 🚀
```

Issues & discussions welcome!

---

## 9 · License

MIT © 2025 \<Andy Luemba>
