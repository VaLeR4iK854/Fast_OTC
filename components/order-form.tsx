"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createOrder } from "@/lib/contract-interactions"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { QrCode, Copy, Check, ArrowRight } from "lucide-react"
import { Steps, Step } from "@/components/ui/steps"

export function OrderForm() {
  const [orderType, setOrderType] = useState("buy")
  const [stablecoin, setStablecoin] = useState("USDT")
  const [amount, setAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userBalance, setUserBalance] = useState<any>({
    fiat: { USD: 0 },
    crypto: {
      "USDT (ERC-20)": 0,
      "USDC (ERC-20)": 0,
    },
  })
  const [loading, setLoading] = useState(true)

  // Transaction simulation states
  const [showSimulation, setShowSimulation] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [contractAddress, setContractAddress] = useState("")
  const [copied, setCopied] = useState(false)
  const [orderId, setOrderId] = useState("")

  // Получаем баланс пользователя из localStorage при загрузке компонента
  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        // Пытаемся получить баланс из localStorage
        const storedBalance = localStorage.getItem("userBalance")
        let balance = 0

        if (storedBalance) {
          balance = JSON.parse(storedBalance)
        } else {
          // Если баланса нет в localStorage, используем дефолтное значение
          balance = 100000
          // Сохраняем дефолтный баланс в localStorage
          localStorage.setItem("userBalance", JSON.stringify(balance))
        }

        setUserBalance({
          fiat: {
            USD: balance,
          },
          crypto: {
            "USDT (ERC-20)": 0,
            "USDC (ERC-20)": 0,
          },
        })
      } catch (error) {
        console.error("Error in fetchUserBalance:", error)
        // В случае любой ошибки устанавливаем дефолтный баланс
        setUserBalance({
          fiat: { USD: 100000 }, // Дефолтный баланс для демонстрации
          crypto: {
            "USDT (ERC-20)": 0,
            "USDC (ERC-20)": 0,
          },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserBalance()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Check if amount is at least 15,000 USD equivalent
    if (Number.parseFloat(amount) < 15000) {
      toast({
        title: "Error",
        description: "Minimum order value must be 15,000 USD equivalent",
        variant: "destructive",
      })
      return
    }

    // Проверяем, указан ли адрес кошелька при покупке криптовалюты (не USD)
    if (orderType === "buy" && stablecoin !== "USD" && !walletAddress) {
      toast({
        title: "Error",
        description: "Please provide a wallet address for receiving cryptocurrency",
        variant: "destructive",
      })
      return
    }

    // Check if user has sufficient balance for buying crypto (not USD)
    if (orderType === "buy" && stablecoin !== "USD") {
      // Calculate fee (0.05%)
      const fee = Number.parseFloat(amount) * 0.0005
      const totalAmount = Number.parseFloat(amount) + fee

      if (userBalance?.fiat?.USD < totalAmount) {
        toast({
          title: "Error",
          description: "Insufficient USD balance",
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Generate a mock contract address
      const mockContractAddress =
        "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

      setContractAddress(mockContractAddress)

      // Create the order
      const newOrderId = await createOrder({
        orderType,
        stablecoin,
        network: "ERC-20",
        amount: Number.parseFloat(amount),
        price: 1, // Fixed price, fee is 0.05%
        paymentMethod: "platform",
        fiatCurrency: "USD",
        walletAddress: orderType === "buy" ? walletAddress : "",
      })

      setOrderId(newOrderId)

      // Show simulation
      setShowSimulation(true)
      setCurrentStep(0)

      toast({
        title: "Success",
        description: "Order created successfully",
      })

      // Генерируем событие для обновления списков ордеров и транзакций
      if (typeof window !== "undefined") {
        console.log("Dispatching orderCreated event")
        const orderCreatedEvent = new Event("orderCreated")
        window.dispatchEvent(orderCreatedEvent)
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const proceedToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      // Обновляем баланс при завершении симуляции
      if (orderType === "buy") {
        if (stablecoin === "USD") {
          // Если покупка USD, увеличиваем баланс на сумму (минус комиссия)
          const fee = calculateFee()
          const newBalance = userBalance.fiat.USD + Number.parseFloat(amount) - fee

          // Обновляем локальное состояние
          setUserBalance({
            ...userBalance,
            fiat: { USD: newBalance },
          })

          // Обновляем баланс в localStorage
          localStorage.setItem("userBalance", JSON.stringify(newBalance))
        } else {
          // Если покупка криптовалюты, уменьшаем баланс на сумму + комиссию
          const newBalance = userBalance.fiat.USD - calculateTotal()

          // Обновляем локальное состояние
          setUserBalance({
            ...userBalance,
            fiat: { USD: newBalance },
          })

          // Обновляем баланс в localStorage
          localStorage.setItem("userBalance", JSON.stringify(newBalance))
        }
      } else {
        // Если продажа, увеличиваем баланс на сумму - комиссию
        const newBalance = userBalance.fiat.USD + Number.parseFloat(amount) - calculateFee()

        // Обновляем локальное состояние
        setUserBalance({
          ...userBalance,
          fiat: { USD: newBalance },
        })

        // Обновляем баланс в localStorage
        localStorage.setItem("userBalance", JSON.stringify(newBalance))
      }

      // Reset the form
      setShowSimulation(false)
      setAmount("")
      setWalletAddress("")
      setIsSubmitting(false)

      // Показываем уведомление об обновлении баланса
      toast({
        title: "Balance Updated",
        description: "Your balance has been updated after the transaction.",
      })

      // Генерируем событие для обновления списков ордеров и транзакций
      if (typeof window !== "undefined") {
        const orderCreatedEvent = new Event("orderCreated")
        window.dispatchEvent(orderCreatedEvent)
      }
    }
  }

  // Calculate fee (0.05%)
  const calculateFee = () => {
    if (!amount) return 0
    return Number.parseFloat(amount) * 0.0005
  }

  // Calculate total amount
  const calculateTotal = () => {
    if (!amount) return 0
    return Number.parseFloat(amount) + calculateFee()
  }

  if (showSimulation) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Execution Simulation</CardTitle>
            <CardDescription>
              Follow the steps to complete your {orderType === "buy" ? "purchase" : "sale"} of {amount} {stablecoin}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Steps currentStep={currentStep} className="mb-8">
              <Step title="Order Created" description="Your order has been created successfully" />
              {orderType === "sell" ? (
                <Step title="Transfer Crypto" description="Send crypto to the smart contract" />
              ) : (
                <Step title="Waiting for Seller" description="Waiting for a seller to take your order" />
              )}
              <Step
                title="Payment Processing"
                description={orderType === "buy" ? "Send fiat payment" : "Receive fiat payment"}
              />
              <Step title="Order Completed" description="Transaction successfully completed" />
            </Steps>

            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">Order Details:</p>
                  <p>Order ID: {orderId}</p>
                  <p>
                    Type: {orderType === "buy" ? "Buy" : "Sell"} {stablecoin} (ERC-20)
                  </p>
                  <p>
                    Amount: {amount} {stablecoin}
                  </p>
                  <p>Fee (0.05%): {calculateFee().toFixed(2)} USD</p>
                  <p>Total: {calculateTotal().toFixed(2)} USD</p>
                  {orderType === "buy" && walletAddress && <p>Receiving Wallet: {walletAddress}</p>}
                </div>
                <Button onClick={proceedToNextStep} className="w-full">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentStep === 1 && orderType === "sell" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <QrCode className="h-32 w-32" />
                  </div>
                  <p className="text-center mb-2">
                    Send {amount} {stablecoin} to this smart contract address:
                  </p>
                  <div className="flex items-center space-x-2 bg-background p-2 rounded-md w-full">
                    <code className="text-xs flex-1 overflow-hidden text-ellipsis">{contractAddress}</code>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    The funds will be locked in the smart contract until the transaction is completed
                  </p>
                </div>
                <Button onClick={proceedToNextStep} className="w-full">
                  I've Sent the Crypto <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentStep === 1 && orderType === "buy" && stablecoin === "USD" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <QrCode className="h-32 w-32" />
                  </div>
                  <p className="text-center mb-2">Send {amount} USDT or USDC to this smart contract address:</p>
                  <div className="flex items-center space-x-2 bg-background p-2 rounded-md w-full">
                    <code className="text-xs flex-1 overflow-hidden text-ellipsis">{contractAddress}</code>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    The funds will be locked in the smart contract until the transaction is completed
                  </p>
                </div>
                <Button onClick={proceedToNextStep} className="w-full">
                  I've Sent the Crypto <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentStep === 1 && orderType === "buy" && stablecoin !== "USD" && (
              <div className="space-y-4">
                <div className="p-6 bg-muted rounded-lg">
                  <p className="text-center mb-4">Your order is now active and waiting for a seller.</p>
                  <p className="text-center text-sm text-muted-foreground">
                    Once a seller takes your order, you'll be notified to proceed with the payment.
                  </p>
                </div>
                <Button onClick={proceedToNextStep} className="w-full">
                  Simulate Seller Found <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                {orderType === "buy" ? (
                  <div className="p-6 bg-muted rounded-lg">
                    <p className="font-medium mb-2">Payment Instructions:</p>
                    <p>Please send {calculateTotal().toFixed(2)} USD to the following account:</p>
                    <div className="mt-4 p-3 bg-background rounded-md">
                      <p>
                        <strong>Bank:</strong> OTC Exchange Bank
                      </p>
                      <p>
                        <strong>Account Number:</strong> 1234567890
                      </p>
                      <p>
                        <strong>Reference:</strong> {orderId}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Once your payment is confirmed, the crypto will be released from the smart contract to your
                      wallet.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-muted rounded-lg">
                    <p className="font-medium mb-2">Payment Status:</p>
                    <p>The buyer is processing the payment of {calculateTotal().toFixed(2)} USD to your account.</p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Once the payment is confirmed, your crypto will be released from the smart contract to the buyer.
                    </p>
                  </div>
                )}
                <Button onClick={proceedToNextStep} className="w-full">
                  {orderType === "buy" ? "I've Sent the Payment" : "Payment Received"}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="p-6 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-center text-lg font-semibold mb-2">Transaction Completed!</h3>
                  <p className="text-center mb-4">
                    Your {orderType === "buy" ? "purchase" : "sale"} of {amount} {stablecoin} has been successfully
                    completed.
                  </p>
                  <div className="bg-white p-3 rounded-md">
                    <p>
                      <strong>Order ID:</strong> {orderId}
                    </p>
                    <p>
                      <strong>Amount:</strong> {amount} {stablecoin}
                    </p>
                    <p>
                      <strong>Fee:</strong> {calculateFee().toFixed(2)} USD (0.05%)
                    </p>
                    <p>
                      <strong>Total:</strong> {calculateTotal().toFixed(2)} USD
                    </p>
                    <p>
                      <strong>Status:</strong> Completed
                    </p>
                    {orderType === "buy" && walletAddress && (
                      <p>
                        <strong>Receiving Wallet:</strong> {walletAddress}
                      </p>
                    )}
                  </div>
                </div>
                <Button onClick={proceedToNextStep} className="w-full">
                  Create New Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Available Balance:</span>
            <span className="text-lg font-bold">${userBalance?.fiat?.USD?.toLocaleString() || "0"} USD</span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orderType">Order Type</Label>
          <Select value={orderType} onValueChange={setOrderType}>
            <SelectTrigger>
              <SelectValue placeholder="Select order type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stablecoin">Currency</Label>
          <Select value={stablecoin} onValueChange={setStablecoin}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-2 bg-muted/50 rounded-md mt-1">
          <p className="text-xs text-muted-foreground">Network: ERC-20 (ZKsync Era)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Minimum order value: 15,000 USD equivalent</p>
        </div>

        {/* Добавляем поле для адреса кошелька только при покупке криптовалюты (не USD) */}
        {orderType === "buy" && stablecoin !== "USD" && (
          <div className="space-y-2">
            <Label htmlFor="wallet-address">Receiving Wallet Address</Label>
            <Input
              id="wallet-address"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the wallet address where you want to receive your cryptocurrency
            </p>
          </div>
        )}

        {amount && Number.parseFloat(amount) >= 15000 && (
          <div className="p-3 bg-muted rounded-md space-y-1">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span>
                {Number.parseFloat(amount).toLocaleString()} {stablecoin}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Fee (0.05%):</span>
              <span>{calculateFee().toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{calculateTotal().toLocaleString()} USD</span>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Order"}
        </Button>
      </form>
    </div>
  )
}

