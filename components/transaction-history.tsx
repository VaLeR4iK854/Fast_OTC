"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Lock, Unlock, RotateCcw } from "lucide-react"
import { getUserTransactions } from "@/lib/contract-interactions"
import type { Transaction } from "@/lib/types"

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Используем фиксированный адрес для демо
        const userAddress = "0x1234567890123456789012345678901234567890"
        const fetchedTransactions = await getUserTransactions(userAddress)

        // Сортируем по времени (сначала новые)
        const sortedTransactions = [...fetchedTransactions].sort((a, b) => b.timestamp - a.timestamp)

        setTransactions(sortedTransactions)
        setError(null)
      } catch (error: any) {
        console.error("Error fetching transactions:", error)
        setError(error.message || "Failed to load transaction history")
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()

    // Устанавливаем интервал для периодического обновления транзакций
    const interval = setInterval(fetchTransactions, 5000)

    // Добавляем обработчик события для обновления транзакций при создании нового ордера
    const handleOrderCreated = () => {
      console.log("Transaction history: Order created event received, updating transactions...")
      fetchTransactions()
    }

    window.addEventListener("orderCreated", handleOrderCreated)

    return () => {
      clearInterval(interval)
      window.removeEventListener("orderCreated", handleOrderCreated)
    }
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading transaction history...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (transactions.length === 0) {
    return <div className="text-center py-8">No transactions found.</div>
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {getTransactionIcon(transaction.type)}
                <CardTitle className="text-base ml-2">{formatTransactionType(transaction.type)}</CardTitle>
              </div>
              <Badge variant={getStatusVariant(transaction.status)}>{transaction.status}</Badge>
            </div>
            <CardDescription>{formatDate(transaction.timestamp)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">
                  {Number(transaction.amount).toLocaleString()} {transaction.currency}
                </p>
              </div>
              {transaction.txHash && (
                <div>
                  <p className="text-muted-foreground">Transaction Hash</p>
                  <p className="font-medium truncate">{shortenHash(transaction.txHash)}</p>
                </div>
              )}
              {transaction.orderId && (
                <div>
                  <p className="text-muted-foreground">Order ID</p>
                  <p className="font-medium">{transaction.orderId}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  function getTransactionIcon(type: string) {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownRight className="h-5 w-5 text-green-500" />
      case "WITHDRAWAL":
        return <ArrowUpRight className="h-5 w-5 text-blue-500" />
      case "ESCROW":
        return <Lock className="h-5 w-5 text-yellow-500" />
      case "RELEASE":
        return <Unlock className="h-5 w-5 text-purple-500" />
      case "REFUND":
        return <RotateCcw className="h-5 w-5 text-red-500" />
      case "ORDER_CREATED":
        return <ArrowUpRight className="h-5 w-5 text-indigo-500" />
      default:
        return <ArrowDownRight className="h-5 w-5 text-gray-500" />
    }
  }

  function formatTransactionType(type: string) {
    switch (type) {
      case "DEPOSIT":
        return "Deposit"
      case "WITHDRAWAL":
        return "Withdrawal"
      case "ESCROW":
        return "Funds Locked in Escrow"
      case "RELEASE":
        return "Funds Released from Escrow"
      case "REFUND":
        return "Funds Refunded"
      case "ORDER_CREATED":
        return "Order Created"
      default:
        return type
    }
  }

  function getStatusVariant(status: string) {
    switch (status) {
      case "PENDING":
        return "warning"
      case "COMPLETED":
        return "success"
      case "FAILED":
        return "destructive"
      default:
        return "default"
    }
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleString()
  }

  function shortenHash(hash: string) {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`
  }
}

