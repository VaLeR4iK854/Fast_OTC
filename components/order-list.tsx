"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOrders, takeOrder, confirmPayment, confirmReceipt, cancelOrder } from "@/lib/contract-interactions"
import { toast } from "@/components/ui/use-toast"
import type { Order } from "@/lib/types"
import Link from "next/link"

interface OrderListProps {
  type: "buy" | "sell"
}

export function OrderList({ type }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await getOrders(type)
        setOrders(fetchedOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
    // Set up an interval to refresh orders
    const interval = setInterval(fetchOrders, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [type])

  const handleTakeOrder = async (orderId: string) => {
    try {
      await takeOrder(orderId)
      toast({
        title: "Success",
        description: "Order taken successfully",
      })
      // Refresh orders
      const fetchedOrders = await getOrders(type)
      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Error taking order:", error)
      toast({
        title: "Error",
        description: "Failed to take order",
        variant: "destructive",
      })
    }
  }

  const handleConfirmPayment = async (orderId: string) => {
    try {
      await confirmPayment(orderId)
      toast({
        title: "Success",
        description: "Payment confirmation sent. Processing payment...",
      })
      // Refresh orders
      const fetchedOrders = await getOrders(type)
      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Error confirming payment:", error)
      toast({
        title: "Error",
        description: "Failed to confirm payment",
        variant: "destructive",
      })
    }
  }

  const handleConfirmReceipt = async (orderId: string) => {
    try {
      await confirmReceipt(orderId)
      toast({
        title: "Success",
        description: "Receipt confirmed successfully. Funds released.",
      })
      // Refresh orders
      const fetchedOrders = await getOrders(type)
      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Error confirming receipt:", error)
      toast({
        title: "Error",
        description: "Failed to confirm receipt",
        variant: "destructive",
      })
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId)
      toast({
        title: "Success",
        description: "Order cancelled successfully",
      })
      // Refresh orders
      const fetchedOrders = await getOrders(type)
      setOrders(fetchedOrders)
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
    return <div className="text-center py-8">Loading orders...</div>
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 bg-muted rounded-lg">
        <p>No {type} orders available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {order.orderType === "buy" ? "Buy" : "Sell"} {order.stablecoin} ({order.network})
              </CardTitle>
              <Badge variant={getStatusVariant(order.status)}>{formatStatus(order.status)}</Badge>
            </div>
            <CardDescription>
              Created by {shortenAddress(order.creator)} • {formatDate(order.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">
                  {order.amount} {order.stablecoin}
                </p>
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
              {order.walletAddress && (
                <div>
                  <p className="text-sm text-muted-foreground">Receiving Wallet</p>
                  <p className="font-medium truncate">{order.walletAddress}</p>
                </div>
              )}
            </div>

            {order.escrowTxHash && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Escrow Transaction:</p>
                <p className="text-xs text-muted-foreground truncate">{order.escrowTxHash}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/order/${order.id}`}>View Details</Link>
            </Button>
            {renderActionButtons(order)}
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  function renderActionButtons(order: Order) {
    // For demo purposes, we'll use a fixed company ID
    const companyId = "0x1234567890123456789012345678901234567890"

    // If the order is created by the current company
    if (order.creator === companyId) {
      if (order.status === "OPEN") {
        return (
          <Button variant="destructive" onClick={() => handleCancelOrder(order.id)}>
            Cancel Order
          </Button>
        )
      }

      if (order.status === "PAYMENT_POSTED" && order.orderType === "sell") {
        return <Button onClick={() => handleConfirmReceipt(order.id)}>Release Funds</Button>
      }

      return <div className="text-sm text-muted-foreground">Waiting for counterparty action</div>
    }

    // If the order is not created by the current company
    if (order.status === "OPEN") {
      return <Button onClick={() => handleTakeOrder(order.id)}>Take Order</Button>
    }

    if (order.status === "LOCKED" && order.taker === companyId && order.orderType === "buy") {
      return <Button onClick={() => handleConfirmPayment(order.id)}>Confirm Fiat Payment Sent</Button>
    }

    return <div className="text-sm text-muted-foreground">Waiting for counterparty action</div>
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

