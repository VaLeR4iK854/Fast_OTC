"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUserOrders, getUserBalance } from "@/lib/contract-interactions"
import type { Order } from "@/lib/types"
import { ConnectButton } from "@/components/connect-button"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function ProfilePage() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState("orders")
  const [orders, setOrders] = useState<Order[]>([])
  const [balance, setBalance] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if wallet is connected
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAddress(accounts[0])
            setIsConnected(true)
          }
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
        } else {
          setAddress(null)
          setIsConnected(false)
        }
      })
    }

    const fetchUserData = async () => {
      if (!address) return

      try {
        const [fetchedOrders, fetchedBalance] = await Promise.all([getUserOrders(address), getUserBalance(address)])

        setOrders(fetchedOrders)
        setBalance(fetchedBalance)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (address) {
      fetchUserData()
    }

    return () => {
      // Clean up listeners
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
      }
    }
  }, [address])

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <p className="mb-6">Please connect your wallet to view your profile.</p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((order) => order.status !== "COMPLETED" && order.status !== "CANCELLED").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter((order) => order.status === "COMPLETED").length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Your Orders</h2>

            {loading ? (
              <div className="text-center py-8">Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 bg-muted rounded-lg">
                <p>You haven't created any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {order.orderType === "buy" ? (
                            <ArrowDownRight className="h-4 w-4 mr-2 text-green-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 mr-2 text-blue-500" />
                          )}
                          <CardTitle className="text-base">
                            {order.orderType === "buy" ? "Buy" : "Sell"} {order.amount} {order.stablecoin}
                          </CardTitle>
                        </div>
                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                      </div>
                      <CardDescription>{formatDate(order.createdAt)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p>${order.price}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p>${(order.amount * order.price).toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="balance">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Your Balance</h2>

            {loading ? (
              <div className="text-center py-8">Loading your balance...</div>
            ) : Object.keys(balance).length === 0 ? (
              <div className="text-center py-8 bg-muted rounded-lg">
                <p>You don't have any balance yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(balance).map(([token, amount]) => (
                  <Card key={token}>
                    <CardHeader>
                      <CardTitle>{token}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{amount}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  function getStatusVariant(status: string) {
    switch (status) {
      case "OPEN":
        return "default"
      case "LOCKED":
        return "secondary"
      case "PAYMENT_SENT":
        return "warning"
      case "COMPLETED":
        return "success"
      case "CANCELLED":
        return "destructive"
      default:
        return "default"
    }
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleString()
  }
}

