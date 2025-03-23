"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderForm } from "@/components/order-form"
import { DepositForm } from "@/components/deposit-form"
import { TransactionHistory } from "@/components/transaction-history"
import { WithdrawalForm } from "@/components/withdrawal-form"
import Link from "next/link"
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
  Lock,
  Unlock,
  RotateCcw,
} from "lucide-react"
import { getCompanyById, getUserTransactions, getUserOrders } from "@/lib/contract-interactions"
import type { Company } from "@/lib/supabase"
import type { Transaction } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [activeFinanceTab, setActiveFinanceTab] = useState("deposit")
  const [balance, setBalance] = useState(0)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({
    totalTrades: 0,
    activeTrades: 0,
    completedTrades: 0,
    tradingVolume: "$0",
  })

  // Загружаем данные компании при монтировании компонента
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const user = localStorage.getItem("currentUser")
        if (!user) {
          router.push("/login")
          return
        }

        const userData = JSON.parse(user)

        // Получаем баланс из localStorage
        const storedBalance = localStorage.getItem("userBalance")
        let userBalance = 0

        if (storedBalance) {
          userBalance = JSON.parse(storedBalance)
        } else {
          // Если баланса нет в localStorage, устанавливаем дефолтное значение
          userBalance = 100000
          localStorage.setItem("userBalance", JSON.stringify(userBalance))
        }

        setBalance(userBalance)

        // Получаем данные компании
        const result = await getCompanyById(userData.id)

        if (!result.success || !result.data) {
          throw new Error("Failed to load company data")
        }

        setCompany(result.data)

        // Загружаем транзакции для Recent Activity
        await fetchTransactionsAndStats()
      } catch (error: any) {
        console.error("Error loading company data:", error)
        setError(error.message || "Failed to load company data")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyData()

    // Добавляем обработчик события для обновления транзакций при создании нового ордера
    const handleOrderCreated = () => {
      fetchTransactionsAndStats()
    }

    window.addEventListener("orderCreated", handleOrderCreated)

    // Устанавливаем интервал для периодического обновления транзакций
    const interval = setInterval(fetchTransactionsAndStats, 10000)

    return () => {
      clearInterval(interval)
      window.removeEventListener("orderCreated", handleOrderCreated)
    }
  }, [router])

  // Функция для загрузки транзакций и статистики
  const fetchTransactionsAndStats = async () => {
    try {
      // Используем фиксированный адрес для демо
      const userAddress = "0x1234567890123456789012345678901234567890"

      // Получаем транзакции
      const transactions = await getUserTransactions(userAddress)

      // Сортируем по времени (сначала новые)
      const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp)

      // Берем только 5 последних транзакций для Recent Activity
      setRecentTransactions(sortedTransactions.slice(0, 5))

      // Получаем ордера для статистики
      const orders = await getUserOrders(userAddress)

      // Рассчитываем статистику
      const totalTrades = orders.length
      const activeTrades = orders.filter(
        (order) => order.status !== "COMPLETED" && order.status !== "CANCELLED" && order.status !== "EXPIRED",
      ).length
      const completedTrades = orders.filter((order) => order.status === "COMPLETED").length

      // Рассчитываем общий объем торгов
      let tradingVolume = 0
      orders.forEach((order) => {
        if (order.status === "COMPLETED") {
          tradingVolume += order.amount * order.price
        }
      })

      setStats({
        totalTrades,
        activeTrades,
        completedTrades,
        tradingVolume: `$${tradingVolume.toLocaleString()}`,
      })
    } catch (error) {
      console.error("Error fetching transactions and stats:", error)
    }
  }

  // Функция для обновления баланса
  const updateBalance = (newBalance: number) => {
    setBalance(newBalance)
    // Сохраняем обновленный баланс в localStorage
    localStorage.setItem("userBalance", JSON.stringify(newBalance))
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading dashboard...</div>
  }

  if (error || !company) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-red-500 mb-4">{error || "Failed to load company data"}</div>
        <Button asChild>
          <Link href="/login">Return to Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{company.name}</h2>
                <p className="text-sm text-muted-foreground">Verified Business</p>
              </div>

              <div className="mt-6 space-y-1">
                <Button
                  variant={activeTab === "overview" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("overview")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Overview
                </Button>
                <Button
                  variant={activeTab === "create" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("create")}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Create Order
                </Button>
                <Button
                  variant={activeTab === "finance" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("finance")}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Finance
                </Button>
                <Button
                  variant={activeTab === "settings" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    localStorage.removeItem("currentUser")
                    router.push("/")
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Dashboard</h1>

              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardHeader>
                  <CardTitle>Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-sm text-muted-foreground">Fiat Balance</p>
                    <p className="text-3xl font-bold">${balance.toLocaleString()} USD</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTrades}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeTrades}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Completed Trades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.completedTrades}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Trading Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.tradingVolume}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest trading activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction, index) => (
                        <div
                          key={transaction.id || index}
                          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="font-medium">
                                {formatTransactionType(transaction.type)} {transaction.amount.toLocaleString()}{" "}
                                {transaction.currency}
                              </p>
                              <p className="text-sm text-muted-foreground">{formatDate(transaction.timestamp)}</p>
                            </div>
                          </div>
                          <div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p>No recent activity found.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Create Order Tab */}
          {activeTab === "create" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Create Order</h1>

              <Card>
                <CardHeader>
                  <CardTitle>New Trading Order</CardTitle>
                  <CardDescription>Create a new buy or sell order for stablecoins</CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderForm />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Finance Tab */}
          {activeTab === "finance" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Finance</h1>

              <Tabs defaultValue="deposit" value={activeFinanceTab} onValueChange={setActiveFinanceTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                <TabsContent value="deposit">
                  <DepositForm currentBalance={balance} onBalanceUpdate={updateBalance} />
                </TabsContent>
                <TabsContent value="withdraw">
                  <WithdrawalForm currentBalance={balance} onBalanceUpdate={updateBalance} />
                </TabsContent>
                <TabsContent value="transactions">
                  <TransactionHistory />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Account Settings</h1>

              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Manage your company details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Company Name</p>
                        <p className="font-medium">{company.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Registration Number</p>
                        <p className="font-medium">{company.registration_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Country</p>
                        <p className="font-medium">{company.country}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Email</p>
                        <p className="font-medium">{company.contact_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Name</p>
                        <p className="font-medium">{company.contact_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Phone</p>
                        <p className="font-medium">{company.contact_phone}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-4">
                      Your company information is verified and cannot be changed. Please contact support if you need to
                      update your company details.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button>Change Password</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  function getTransactionIcon(type: string) {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownRight className="h-10 w-10 text-green-500 bg-green-100 p-2 rounded-full mr-4" />
      case "WITHDRAWAL":
        return <ArrowUpRight className="h-10 w-10 text-blue-500 bg-blue-100 p-2 rounded-full mr-4" />
      case "ESCROW":
        return <Lock className="h-10 w-10 text-yellow-500 bg-yellow-100 p-2 rounded-full mr-4" />
      case "RELEASE":
        return <Unlock className="h-10 w-10 text-purple-500 bg-purple-100 p-2 rounded-full mr-4" />
      case "REFUND":
        return <RotateCcw className="h-10 w-10 text-red-500 bg-red-100 p-2 rounded-full mr-4" />
      case "ORDER_CREATED":
        return <ArrowUpRight className="h-10 w-10 text-indigo-500 bg-indigo-100 p-2 rounded-full mr-4" />
      default:
        return <ArrowDownRight className="h-10 w-10 text-gray-500 bg-gray-100 p-2 rounded-full mr-4" />
    }
  }

  function formatTransactionType(type: string) {
    switch (type) {
      case "DEPOSIT":
        return "Deposit"
      case "WITHDRAWAL":
        return "Withdrawal"
      case "ESCROW":
        return "Funds Locked"
      case "RELEASE":
        return "Funds Released"
      case "REFUND":
        return "Refund"
      case "ORDER_CREATED":
        return "Order Created"
      default:
        return type
    }
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleString()
  }
}

