"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getOrderById, takeOrder, confirmPayment, confirmReceipt, cancelOrder } from "@/lib/contract-interactions"
import { toast } from "@/components/ui/use-toast"
import type { Order } from "@/lib/types"
import { ArrowLeft, AlertCircle, Lock, Unlock, ArrowUpRight, RotateCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OrderPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (typeof id !== "string") {
          throw new Error("Invalid order ID")
        }

        const fetchedOrder = await getOrderById(id)
        setOrder(fetchedOrder)
        setError(null)
      } catch (error) {
        console.error("Error fetching order:", error)
        setError("Failed to fetch order details")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
    // Set up an interval to refresh order
    const interval = setInterval(fetchOrder, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [id])

  const handleTakeOrder = async () => {
    if (!order) return

    try {
      await takeOrder(order.id)
      toast({
        title: "Success",
        description: "Order taken successfully",
      })
      // Refresh order
      const fetchedOrder = await getOrderById(order.id)
      setOrder(fetchedOrder)
    } catch (error) {
      console.error("Error taking order:", error)
      toast({
        title: "Error",
        description: "Failed to take order",
        variant: "destructive",
      })
    }
  }

  const handleConfirmPayment = async () => {
    if (!order) return

    try {
      await confirmPayment(order.id)
      toast({
        title: "Success",
        description: "Payment confirmation sent. Processing payment...",
      })
      // Refresh order
      const fetchedOrder = await getOrderById(order.id)
      setOrder(fetchedOrder)
    } catch (error) {
      console.error("Error confirming payment:", error)
      toast({
        title: "Error",
        description: "Failed to confirm payment",
        variant: "destructive",
      })
    }
  }

  const handleConfirmReceipt = async () => {
    if (!order) return

    try {
      await confirmReceipt(order.id)
      toast({
        title: "Success",
        description: "Receipt confirmed successfully. Funds released.",
      })
      // Refresh order
      const fetchedOrder = await getOrderById(order.id)
      setOrder(fetchedOrder)
    } catch (error) {
      console.error("Error confirming receipt:", error)
      toast({
        title: "Error",
        description: "Failed to confirm receipt",
        variant: "destructive",
      })
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return

    try {
      await cancelOrder(order.id)
      toast({
        title: "Success",
        description: "Order cancelled successfully",
      })
      // Refresh order
      const fetchedOrder = await getOrderById(order.id)
      setOrder(fetchedOrder)
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">Loading order details...</div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Order not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {order.orderType === "buy" ? "Buy" : "Sell"} {order.stablecoin} ({order.network})
            </CardTitle>
            <Badge variant={getStatusVariant(order.status)}>{formatStatus(order.status)}</Badge>
          </div>
          <CardDescription>Order ID: {order.id}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Creator</p>
              <p className="font-medium">{shortenAddress(order.creator)}</p>
            </div>
            {order.taker && (
              <div>
                <p className="text-sm text-muted-foreground">Taker</p>
                <p className="font-medium">{shortenAddress(order.taker)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            {order.updatedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(order.updatedAt)}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium">
                {order.amount} {order.stablecoin}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Network</p>
              <p className="font-medium">{order.network}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="font-medium">${order.price}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-medium">${(order.amount * order.price).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium">{formatPaymentMethod(order.paymentMethod)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fiat Currency</p>
              <p className="font-medium">{order.fiatCurrency || "USD"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wallet Address</p>
              <p className="font-medium">{order.walletAddress || "Not specified"}</p>
            </div>
          </div>

          {/* Transaction Details */}
          {(order.escrowTxHash || order.releaseTxHash || order.refundTxHash || order.fiatTxId) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Transaction Details</h3>

                {order.escrowTxHash && (
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-md">
                    <Lock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Escrow Transaction</p>
                      <p className="text-xs text-muted-foreground break-all">{order.escrowTxHash}</p>
                    </div>
                  </div>
                )}

                {order.fiatTxId && (
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-md">
                    <ArrowUpRight className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Fiat Payment Transaction</p>
                      <p className="text-xs text-muted-foreground">ID: {order.fiatTxId}</p>
                      <p className="text-xs text-muted-foreground">
                        Status: {order.status === "PAYMENT_POSTED" ? "Posted" : "Processing"}
                      </p>
                    </div>
                  </div>
                )}

                {order.releaseTxHash && (
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-md">
                    <Unlock className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Release Transaction</p>
                      <p className="text-xs text-muted-foreground break-all">{order.releaseTxHash}</p>
                    </div>
                  </div>
                )}

                {order.refundTxHash && (
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-md">
                    <RotateCcw className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Refund Transaction</p>
                      <p className="text-xs text-muted-foreground break-all">{order.refundTxHash}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {order.status !== "OPEN" && order.status !== "CANCELLED" && order.status !== "EXPIRED" && (
            <>
              <Separator />

              <div className="space-y-2">
                <p className="font-medium">Payment Instructions</p>
                <div className="bg-muted p-4 rounded-md">
                  <p>
                    {order.orderType === "buy"
                      ? "Please send the payment to the following account:"
                      : "Please expect payment from:"}
                  </p>
                  <p className="mt-2">
                    <strong>Bank:</strong> Example Bank
                    <br />
                    <strong>Account Number:</strong> XXXX-XXXX-XXXX-1234
                    <br />
                    <strong>Reference:</strong> OTC-{order.id.slice(0, 8)}
                  </p>
                </div>
              </div>
            </>
          )}

          {getOrderStatusMessage(order)}
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">{renderActionButtons(order)}</CardFooter>
      </Card>
    </div>
  )

  function renderActionButtons(order: Order) {
    // For demo purposes, we'll use a fixed company ID
    const companyId = "0x1234567890123456789012345678901234567890"

    // If the order is created by the current company
    if (order.creator === companyId) {
      if (order.status === "OPEN") {
        return (
          <Button variant="destructive" onClick={handleCancelOrder}>
            Cancel Order
          </Button>
        )
      }

      if (order.status === "PAYMENT_POSTED" && order.orderType === "sell") {
        return <Button onClick={handleConfirmReceipt}>Release Funds</Button>
      }

      return null
    }

    // If the order is not created by the current company
    if (order.status === "OPEN") {
      return <Button onClick={handleTakeOrder}>Take Order</Button>
    }

    if (order.status === "LOCKED" && order.taker === companyId && order.orderType === "buy") {
      return <Button onClick={handleConfirmPayment}>Confirm Fiat Payment Sent</Button>
    }

    return null
  }

  function getOrderStatusMessage(order: Order) {
    switch (order.status) {
      case "OPEN":
        return (
          <Alert>
            <AlertTitle>Open Order</AlertTitle>
            <AlertDescription>This order is open and waiting for a counterparty.</AlertDescription>
          </Alert>
        )
      case "LOCKED":
        return (
          <Alert>
            <AlertTitle>Escrow Locked</AlertTitle>
            <AlertDescription>
              {order.orderType === "buy"
                ? "The seller has locked the stablecoins in escrow. Please send the fiat payment."
                : "Your stablecoins are locked in escrow. Waiting for the buyer to send the fiat payment."}
            </AlertDescription>
          </Alert>
        )
      case "PAYMENT_SENT":
        return (
          <Alert>
            <AlertTitle>Payment Sent</AlertTitle>
            <AlertDescription>
              {order.orderType === "buy"
                ? "You've confirmed sending the fiat payment. Waiting for payment processing."
                : "The buyer has confirmed sending the fiat payment. Waiting for payment processing."}
            </AlertDescription>
          </Alert>
        )
      case "PAYMENT_POSTED":
        return (
          <Alert>
            <AlertTitle>Payment Posted</AlertTitle>
            <AlertDescription>
              {order.orderType === "buy"
                ? "The fiat payment has been posted. Waiting for the seller to release the stablecoins."
                : "The fiat payment has been posted. Please release the stablecoins to complete the transaction."}
            </AlertDescription>
          </Alert>
        )
      case "COMPLETED":
        return (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle>Order Completed</AlertTitle>
            <AlertDescription>
              This order has been successfully completed. The stablecoins have been transferred to the buyer.
            </AlertDescription>
          </Alert>
        )
      case "CANCELLED":
        return (
          <Alert variant="destructive">
            <AlertTitle>Order Cancelled</AlertTitle>
            <AlertDescription>
              This order has been cancelled. Any locked funds have been returned to the seller.
            </AlertDescription>
          </Alert>
        )
      case "EXPIRED":
        return (
          <Alert variant="destructive">
            <AlertTitle>Order Expired</AlertTitle>
            <AlertDescription>
              This order has expired. Any locked funds have been returned to the seller.
            </AlertDescription>
          </Alert>
        )
      default:
        return null
    }
  }

  function getStatusVariant(status: string) {
    switch (status) {
      case "OPEN":
        return "default"
      case "LOCKED":
        return "secondary"
      case "PAYMENT_SENT":
        return "warning"
      case "PAYMENT_POSTED":
        return "warning"
      case "COMPLETED":
        return "success"
      case "CANCELLED":
        return "destructive"
      case "EXPIRED":
        return "destructive"
      default:
        return "default"
    }
  }

  function formatStatus(status: string) {
    switch (status) {
      case "PAYMENT_POSTED":
        return "PAYMENT POSTED"
      default:
        return status
    }
  }

  function shortenAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleString()
  }

  function formatPaymentMethod(method: string) {
    switch (method) {
      case "bank":
        return "Bank Transfer"
      case "wire":
        return "Wire Transfer"
      case "sepa":
        return "SEPA"
      default:
        return method
    }
  }
}

