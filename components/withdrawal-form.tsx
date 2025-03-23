"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { processWithdrawal } from "@/lib/db-service"

interface WithdrawalFormProps {
  currentBalance: number
  onBalanceUpdate?: (newBalance: number) => void
}

export function WithdrawalForm({ currentBalance, onBalanceUpdate }: WithdrawalFormProps) {
  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [withdrawalMethod, setWithdrawalMethod] = useState("wire_transfer")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Получаем ID пользователя из localStorage при монтировании компонента
  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    if (!userId) {
      setError("User not authenticated")
      setLoading(false)
      return
    }

    const withdrawalAmount = Number.parseFloat(amount)

    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError("Please enter a valid amount")
      setLoading(false)
      return
    }

    if (withdrawalAmount > currentBalance) {
      setError("Withdrawal amount exceeds your available balance")
      setLoading(false)
      return
    }

    try {
      // Обрабатываем вывод средств через сервисный слой
      const result = await processWithdrawal(userId, withdrawalAmount)

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to process withdrawal")
      }

      // Обновляем баланс в UI
      if (onBalanceUpdate && result.newBalance !== undefined) {
        onBalanceUpdate(result.newBalance)

        // Сохраняем обновленный баланс в localStorage для синхронизации между компонентами
        localStorage.setItem("userBalance", JSON.stringify(result.newBalance))
      }

      setSuccess(true)
      setAmount("")
      setBankName("")
      setAccountNumber("")
      setAccountName("")

      toast({
        title: "Success",
        description: `Withdrawal request for $${withdrawalAmount.toLocaleString()} has been submitted.`,
      })
    } catch (error: any) {
      console.error("Withdrawal error:", error)
      setError(error.message || "Failed to process withdrawal. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Funds</CardTitle>
        <CardDescription>Withdraw your funds to your bank account</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4">
            <p className="font-medium">Withdrawal Request Submitted</p>
            <p className="text-sm mt-1">Your withdrawal request has been submitted and is being processed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="balance">Available Balance</Label>
              <div className="p-2 bg-gray-50 rounded-md">
                <p className="font-medium">${currentBalance.toLocaleString()} USD</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawal-method">Withdrawal Method</Label>
              <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select withdrawal method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                  <SelectItem value="swift">SWIFT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank-id">Bank ID (Swift or Routing Number)</Label>
              <Input
                id="bank-id"
                placeholder="Enter Swift or Routing Number"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-name">Account Holder Name</Label>
              <Input
                id="account-name"
                placeholder="Enter account holder name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Submit Withdrawal Request"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

