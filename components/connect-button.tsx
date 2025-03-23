"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WalletIcon } from "lucide-react"

export function ConnectButton() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if wallet is already connected
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

    return () => {
      // Clean up listeners
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
      }
    }
  }, [])

  const connect = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setAddress(accounts[0])
        setIsConnected(true)
      } catch (error) {
        console.error("Error connecting to wallet:", error)
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet")
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center justify-between w-full p-4 bg-card rounded-lg shadow">
        <div className="flex items-center">
          <WalletIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <Button variant="outline" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button className="w-full" onClick={connect}>
      <WalletIcon className="h-5 w-5 mr-2" />
      Connect Wallet
    </Button>
  )
}

