export interface Order {
  id: string
  creator: string
  taker?: string
  orderType: "buy" | "sell"
  stablecoin: string
  network: string
  amount: number
  price: number
  paymentMethod: string
  fiatCurrency: string
  status: "OPEN" | "LOCKED" | "PAYMENT_SENT" | "PAYMENT_POSTED" | "COMPLETED" | "CANCELLED" | "EXPIRED"
  createdAt: number
  updatedAt?: number
  escrowTxHash?: string
  releaseTxHash?: string
  refundTxHash?: string
  fiatTxId?: string
  fee?: number
  walletAddress?: string
}

export interface Transaction {
  id: string
  type: string
  currency: string
  amount: number
  status: string
  txHash?: string
  timestamp: number
  orderId?: string
}

