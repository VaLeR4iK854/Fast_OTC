"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { processDeposit } from "@/lib/db-service"

interface DepositFormProps {
  currentBalance: number
  onBalanceUpdate?: (newBalance: number) => void
}

export function DepositForm({ currentBalance, onBalanceUpdate }: DepositFormProps) {
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
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

    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    // Check if amount is at least 15,000 USD or equivalent
    if (Number.parseFloat(amount) < 15000) {
      toast({
        title: "Error",
        description: "Minimum deposit amount is 15,000 USD",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Обрабатываем депозит через сервисный слой
      const result = await processDeposit(userId, Number.parseFloat(amount))

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to process deposit")
      }

      // Обновляем баланс в UI
      if (onBalanceUpdate && result.newBalance !== undefined) {
        onBalanceUpdate(result.newBalance)

        // Сохраняем обновленный баланс в localStorage для синхронизации между компонентами
        localStorage.setItem("userBalance", JSON.stringify(result.newBalance))
      }

      toast({
        title: "Success",
        description: `Successfully deposited ${amount} USD`,
      })

      // Сбрасываем форму
      setAmount("")
    } catch (error: any) {
      console.error("Error depositing funds:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to deposit funds. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Funds</CardTitle>
        <CardDescription>Add funds to your account to start trading</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Balance Display */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Current Balance</h3>
          <div className="flex justify-between">
            <span>USD:</span>
            <span className="font-bold">${currentBalance.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="15000"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">Minimum deposit: 15,000 USD</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select defaultValue="wire">
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wire">Wire Transfer</SelectItem>
                <SelectItem value="swift">SWIFT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Deposit"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>Fiat deposits will be processed within 1-2 hours</p>
      </CardFooter>
    </Card>
  )
}

