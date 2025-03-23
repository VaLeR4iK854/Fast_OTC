"use client"

import type { Order, Transaction } from "./types"

// Mock contract address - would be replaced with actual deployed contract address
const contractAddress = "0x123456789abcdef123456789abcdef123456789a"

// Update the mock orders with larger amounts
const mockOrders: Order[] = [
  {
    id: "order1",
    creator: "0x1234567890123456789012345678901234567890",
    orderType: "sell",
    stablecoin: "USDT",
    network: "ERC-20",
    amount: 50000,
    price: 1.01,
    paymentMethod: "platform",
    fiatCurrency: "USD",
    status: "OPEN",
    createdAt: Date.now() - 3600000,
  },
  {
    id: "order2",
    creator: "0x2345678901234567890123456789012345678901",
    orderType: "buy",
    stablecoin: "USDC",
    network: "ERC-20",
    amount: 25000,
    price: 0.99,
    paymentMethod: "platform",
    fiatCurrency: "USD",
    status: "OPEN",
    createdAt: Date.now() - 7200000,
  },
  {
    id: "order3",
    creator: "0x1234567890123456789012345678901234567890",
    taker: "0x3456789012345678901234567890123456789012",
    orderType: "sell",
    stablecoin: "USDT",
    network: "ERC-20",
    amount: 100000,
    price: 1.0,
    paymentMethod: "platform",
    fiatCurrency: "USD",
    status: "LOCKED",
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 43200000,
    escrowTxHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
]

// Update mock transactions with larger amounts
const mockTransactions: Transaction[] = [
  {
    id: "tx1",
    type: "DEPOSIT",
    currency: "USDT (ERC-20)",
    amount: 250000,
    status: "COMPLETED",
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    timestamp: Date.now() - 86400000 * 7,
  },
  {
    id: "tx2",
    type: "DEPOSIT",
    currency: "USD",
    amount: 500000,
    status: "COMPLETED",
    timestamp: Date.now() - 86400000 * 5,
  },
  {
    id: "tx3",
    type: "ESCROW",
    currency: "USDT (ERC-20)",
    amount: 100000,
    status: "COMPLETED",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    timestamp: Date.now() - 43200000,
    orderId: "order3",
  },
]

// Generate a mock transaction hash
function generateTxHash(): string {
  return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

// Generate a mock transaction ID
function generateTxId(): string {
  return "TX" + Date.now().toString() + Math.floor(Math.random() * 1000).toString()
}

// Получение баланса пользователя из localStorage
function getUserFiatBalance(): number {
  if (typeof window !== "undefined") {
    const storedBalance = localStorage.getItem("userBalance")
    if (storedBalance) {
      return JSON.parse(storedBalance)
    }
  }
  return 100000 // Дефолтный баланс, если localStorage недоступен
}

// Обновление баланса пользователя в localStorage
function updateUserFiatBalance(newBalance: number): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("userBalance", JSON.stringify(newBalance))
  }
}

// Создание нового ордера
export async function createOrder({
  orderType,
  stablecoin,
  network = "ERC-20",
  amount,
  price = 1,
  paymentMethod = "platform",
  fiatCurrency = "USD",
  walletAddress = "",
}: {
  orderType: string
  stablecoin: string
  network?: string
  amount: number
  price?: number
  paymentMethod?: string
  fiatCurrency?: string
  walletAddress?: string
}) {
  try {
    const orderId = `order${mockOrders.length + 1}_${Date.now()}`
    const creatorAddress = "0x1234567890123456789012345678901234567890"

    // Рассчитываем комиссию (0.05%)
    const fee = amount * 0.0005
    const totalAmount = amount + fee

    // Создаем заказ
    const newOrder: Order = {
      id: orderId,
      creator: creatorAddress,
      orderType: orderType as "buy" | "sell",
      stablecoin,
      network: "ERC-20",
      amount,
      price: price,
      paymentMethod: "platform",
      fiatCurrency,
      status: "OPEN",
      createdAt: Date.now(),
      fee: fee,
      walletAddress: walletAddress || "",
    }

    // Если это заказ на покупку криптовалюты (не USD), проверяем баланс фиата
    if (orderType === "buy" && stablecoin !== "USD") {
      // Получаем актуальный баланс из localStorage
      const userFiatBalance = getUserFiatBalance()

      if (userFiatBalance < totalAmount) {
        throw new Error(`Insufficient fiat balance. Available: ${userFiatBalance}, Required: ${totalAmount}`)
      }

      // Обновляем баланс в localStorage
      updateUserFiatBalance(userFiatBalance - totalAmount)
    }

    mockOrders.push(newOrder)

    // Создаем запись транзакции для создания заказа
    const txId = generateTxId()
    const orderTx: Transaction = {
      id: txId,
      type: "ORDER_CREATED",
      currency: stablecoin === "USD" ? "USD" : `${stablecoin} (ERC-20)`,
      amount: amount,
      status: "COMPLETED",
      timestamp: Date.now(),
      orderId: orderId,
    }

    mockTransactions.push(orderTx)

    return orderId
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

// Получение ордеров по типу
export async function getOrders(type: "buy" | "sell") {
  try {
    return mockOrders.filter((order) => order.orderType === type)
  } catch (error) {
    console.error("Error getting orders:", error)
    throw error
  }
}

// Получение ордера по ID
export async function getOrderById(orderId: string) {
  try {
    const order = mockOrders.find((order) => order.id === orderId)
    if (!order) {
      throw new Error("Order not found")
    }
    return order
  } catch (error) {
    console.error("Error getting order:", error)
    throw error
  }
}

// Принятие ордера
export async function takeOrder(orderId: string) {
  try {
    const order = mockOrders.find((order) => order.id === orderId)
    if (!order) {
      throw new Error("Order not found")
    }

    const takerAddress = "0x3456789012345678901234567890123456789012"

    // Создаем транзакцию эскроу
    const txHash = generateTxHash()
    const escrowTx: Transaction = {
      id: generateTxId(),
      type: "ESCROW",
      currency: `${order.stablecoin} (${order.network})`,
      amount: order.amount,
      status: "COMPLETED",
      txHash,
      timestamp: Date.now(),
      orderId,
    }

    mockTransactions.push(escrowTx)

    // Обновляем ордер
    order.escrowTxHash = txHash
    order.status = "LOCKED"
    order.taker = takerAddress
    order.updatedAt = Date.now()

    return true
  } catch (error) {
    console.error("Error taking order:", error)
    throw error
  }
}

// Подтверждение отправки фиатного платежа
export async function confirmPayment(orderId: string) {
  try {
    const order = mockOrders.find((order) => order.id === orderId)
    if (!order) {
      throw new Error("Order not found")
    }

    // Создаем транзакцию фиатного платежа
    const fiatTxId = generateTxId()
    const fiatTx: Transaction = {
      id: fiatTxId,
      type: "WITHDRAWAL",
      currency: order.fiatCurrency,
      amount: order.amount * order.price,
      status: "PENDING",
      timestamp: Date.now(),
      orderId,
    }

    mockTransactions.push(fiatTx)

    // Обновляем ордер
    order.status = "PAYMENT_SENT"
    order.fiatTxId = fiatTxId
    order.updatedAt = Date.now()

    // Симулируем задержку обработки платежа
    setTimeout(() => {
      // Обновляем статус транзакции
      const tx = mockTransactions.find((t) => t.id === fiatTxId)
      if (tx) {
        tx.status = "COMPLETED"
      }

      // Обновляем статус ордера
      order.status = "PAYMENT_POSTED"
      order.updatedAt = Date.now()
    }, 5000)

    return true
  } catch (error) {
    console.error("Error confirming payment:", error)
    throw error
  }
}

// Подтверждение получения фиатного платежа
export async function confirmReceipt(orderId: string) {
  try {
    const order = mockOrders.find((order) => order.id === orderId)
    if (!order) {
      throw new Error("Order not found")
    }

    // Создаем транзакцию освобождения средств
    const txHash = generateTxHash()
    const releaseTx: Transaction = {
      id: generateTxId(),
      type: "RELEASE",
      currency: `${order.stablecoin} (${order.network})`,
      amount: order.amount,
      status: "COMPLETED",
      txHash,
      timestamp: Date.now(),
      orderId,
    }

    mockTransactions.push(releaseTx)

    // Обновляем ордер
    order.status = "COMPLETED"
    order.releaseTxHash = txHash
    order.updatedAt = Date.now()

    return true
  } catch (error) {
    console.error("Error confirming receipt:", error)
    throw error
  }
}

// Отмена ордера
export async function cancelOrder(orderId: string) {
  try {
    const order = mockOrders.find((order) => order.id === orderId)
    if (!order) {
      throw new Error("Order not found")
    }

    // Если это ордер на покупку, возвращаем зарезервированные средства
    if (order.orderType === "buy" && order.status === "OPEN" && order.stablecoin !== "USD") {
      const userFiatBalance = getUserFiatBalance()
      const fee = order.amount * 0.0005
      const totalAmount = order.amount + fee

      // Обновляем баланс в localStorage
      updateUserFiatBalance(userFiatBalance + totalAmount)
    }

    // Создаем транзакцию возврата средств, если есть эскроу
    if (order.escrowTxHash) {
      const txHash = generateTxHash()
      const refundTx: Transaction = {
        id: generateTxId(),
        type: "REFUND",
        currency: `${order.stablecoin} (${order.network})`,
        amount: order.amount,
        status: "COMPLETED",
        txHash,
        timestamp: Date.now(),
        orderId,
      }

      mockTransactions.push(refundTx)
      order.refundTxHash = txHash
    }

    // Обновляем ордер
    order.status = "CANCELLED"
    order.updatedAt = Date.now()

    return true
  } catch (error) {
    console.error("Error cancelling order:", error)
    throw error
  }
}

// Получение ордеров пользователя
export async function getUserOrders(userAddress: string) {
  try {
    return mockOrders.filter((order) => order.creator === userAddress || order.taker === userAddress)
  } catch (error) {
    console.error("Error getting user orders:", error)
    throw error
  }
}

// Получение баланса пользователя
export async function getUserBalance(userAddress: string) {
  try {
    const fiatBalance = getUserFiatBalance()

    return {
      fiat: { USD: fiatBalance },
      crypto: {
        "USDT (ERC-20)": 0,
        "USDC (ERC-20)": 0,
      },
    }
  } catch (error) {
    console.error("Error getting user balance:", error)
    throw error
  }
}

// Получение транзакций пользователя
export async function getUserTransactions(userAddress: string) {
  try {
    const userOrderIds = mockOrders
      .filter((order) => order.creator === userAddress || order.taker === userAddress)
      .map((order) => order.id)

    return mockTransactions.filter(
      (tx) => (tx.orderId && userOrderIds.includes(tx.orderId)) || tx.type === "DEPOSIT" || tx.type === "WITHDRAWAL",
    )
  } catch (error) {
    console.error("Error getting user transactions:", error)
    throw error
  }
}

// Депозит фиатных средств
export async function depositFiat(userAddress: string, amount: number, currency = "USD") {
  try {
    // Создаем транзакцию депозита
    const depositTx: Transaction = {
      id: generateTxId(),
      type: "DEPOSIT",
      currency,
      amount,
      status: "COMPLETED",
      timestamp: Date.now(),
    }

    mockTransactions.push(depositTx)

    // Обновляем баланс пользователя
    const currentBalance = getUserFiatBalance()
    updateUserFiatBalance(currentBalance + amount)

    return depositTx.id
  } catch (error) {
    console.error("Error depositing fiat:", error)
    throw error
  }
}

// Получение данных компании по ID
export async function getCompanyById(id: string) {
  try {
    if (!id) {
      return {
        success: true,
        data: {
          id: "default",
          balance: 0,
          name: "Guest User",
        },
      }
    }

    // Получаем баланс из localStorage
    const balance = getUserFiatBalance()
    let name = "Demo Company"

    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          name = userData.companyName || "Demo Company"
        } catch (e) {
          console.error("Error parsing user data from localStorage:", e)
        }
      }
    }

    return {
      success: true,
      data: {
        id: id,
        balance: balance,
        name: name,
      },
    }
  } catch (error) {
    console.error("Error getting company by ID:", error)
    return {
      success: true,
      data: {
        id: "default",
        balance: 0,
        name: "Guest User",
      },
    }
  }
}

