"use client"

import { useState } from "react"
import { OrderForm } from "@/components/order-form"
import { OrderList } from "@/components/order-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TradePage() {
  const [activeTab, setActiveTab] = useState("buy")
  // Check if user is logged in - this would normally come from an auth context or API
  const isLoggedIn = false // For demo purposes, set to false to show registration prompt

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-4xl font-bold mb-4">OTC Trading Platform</h1>
        <p className="text-xl text-center max-w-2xl mb-6">
          Create or take orders to exchange stablecoins for fiat currency with smart contract security.
        </p>
      </div>

      {isLoggedIn ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Create Order</h2>
              <OrderForm />
            </div>
          </div>
          <div className="lg:col-span-2">
            <Tabs defaultValue="buy" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">Buy Orders</TabsTrigger>
                <TabsTrigger value="sell">Sell Orders</TabsTrigger>
              </TabsList>
              <TabsContent value="buy">
                <OrderList type="buy" />
              </TabsContent>
              <TabsContent value="sell">
                <OrderList type="sell" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
          <Alert className="max-w-2xl mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Company Registration Required</AlertTitle>
            <AlertDescription>
              To use our OTC trading platform, you need to register your company first. This is required for compliance
              and to ensure secure trading.
            </AlertDescription>
          </Alert>
          <Button asChild size="lg">
            <Link href="/register">Register Your Company</Link>
          </Button>
        </div>
      )}
    </main>
  )
}

