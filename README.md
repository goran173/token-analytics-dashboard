# Token Analytics Dashboard 📊

**Professional On-chain Insights for ERC-20 Tokens**

Decode the activity of any smart contract across the most popular EVM chains. Built for speed, precision, and deep research.

![Token Analytics Dashboard Screenshot](https://raw.githubusercontent.com/placeholder/og-image.png)

## 🚀 Live Demo
[https://token-analytics-dashboard.vercel.app](https://token-analytics-dashboard.vercel.app)

## ✨ Features

- **Multi-Chain Support**: Ethereum, Arbitrum, Base, and Polygon.
- **Real-time Transfers**: Detailed log of the last 100 transactions in the recent block window.
- **Holder Distribution**: Derived approximation of top active holders based on net flow analysis.
- **Volume Visualization**: 24-hour transfer volume and hourly activity trends.
- **Wallet Integration**: Connect with RainbowKit to track your own balance and market position.
- **Watchlist & History**: Persistent storage for your favorite tokens and recent searches.
- **CSV Export**: Download transaction logs for offline analysis.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Blockchain**: Viem & Wagmi (v2)
- **Wallet UI**: RainbowKit
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS & Shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Radix Toast

## 🏛️ Architecture Notes

### Why Next.js App Router?
The App Router provides superior performance through React Server Components (where applicable) and a clean, file-based routing system that aligns perfectly with modern web standards.

### Why Viem over Ethers.js?
Viem offers a significantly smaller bundle size, better type safety, and a more modular API that fits the functional programming paradigm of modern React. Its handling of multicalls and JSON-RPC interactions is markedly more efficient.

### The "Active Holders" Approximation
Unlike a traditional indexer (like The Graph or Goldsky) which maintains a full historical state, this dashboard calculates holder distribution on-the-fly from the last 5,000 blocks. 
- **Pros**: Zero latency, no infrastructure costs, decentralized (queries RPC directly).
- **Cons**: Transfer history is limited to the block window; it primarily reflects *active* market participants rather than long-term inactive whales.

## 🛠️ Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_key_here
   ```

3. **Run Dev Server**
   ```bash
   npm run dev
   ```

## 🚢 Deployment

This project is optimized for **Vercel**. Simply connect your GitHub repository and add your `NEXT_PUBLIC_ALCHEMY_API_KEY` to the environment variables.

## ⚠️ Known Limitations

- **Block Window**: Data is limited to the last ~5,000 blocks per search to ensure RPC stability.
- **Derived Balances**: Holder balances are calculated from transfers in the window; starting balances outside the window are not factored in.
- **Rate Limits**: Heavy usage depends on your Alchemy API tier.

---
*Built for demonstration purposes. Always verify on-chain data before making financial decisions.*
