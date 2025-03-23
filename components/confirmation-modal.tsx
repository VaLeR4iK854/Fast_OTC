"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ConfirmationModal({ isOpen, onClose }: ConfirmationModalProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleRedirect = () => {
    onClose()
    router.push("/dashboard")
  }

  if (!isOpen && !isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 overflow-hidden">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Company Verified!</h3>
          <p className="text-gray-600 mb-6">
            Your company has been successfully verified. You can now start trading on our platform.
          </p>
          <Button onClick={handleRedirect} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

