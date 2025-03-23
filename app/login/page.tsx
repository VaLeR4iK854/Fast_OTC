"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GradientButton } from "@/components/ui/gradient-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { getCompanyByEmail } from "@/lib/db-service"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Получаем данные компании по email
      const result = await getCompanyByEmail(email)

      if (!result.success || !result.data) {
        throw new Error("Invalid email or company not registered")
      }

      // Сохраняем информацию о пользователе в localStorage
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: result.data.id,
          email: email,
          companyName: result.data.name,
        }),
      )

      // Устанавливаем баланс в localStorage
      localStorage.setItem("userBalance", JSON.stringify(result.data.balance || 100000))

      // Создаем событие для оповещения других компонентов об изменении авторизации
      window.dispatchEvent(new Event("storage"))

      // Перенаправляем на панель управления
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Invalid email or company not registered")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login to OTC Exchange</CardTitle>
          <CardDescription>Enter your email to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="company@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <GradientButton type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </GradientButton>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register your company
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

