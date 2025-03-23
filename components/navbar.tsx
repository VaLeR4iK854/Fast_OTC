"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")

  // Функция для проверки авторизации
  const checkAuth = () => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      try {
        const userData = JSON.parse(user)
        setIsLoggedIn(true)
        setUserName(userData.companyName || "My Account")
      } catch (e) {
        console.error("Error parsing user data:", e)
        setIsLoggedIn(false)
        setUserName("")
      }
    } else {
      setIsLoggedIn(false)
      setUserName("")
    }
  }

  useEffect(() => {
    // Проверяем авторизацию при монтировании компонента
    checkAuth()

    // Добавляем слушатель события storage для отслеживания изменений в localStorage
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)

    // Создаем интервал для периодической проверки авторизации
    const interval = setInterval(checkAuth, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("userBalance")
    setIsLoggedIn(false)
    setUserName("")

    // Перенаправляем на главную страницу
    router.push("/")
  }

  // Убираем навигационные пункты, так как кнопка Dashboard дублируется
  const navItems = []

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center mr-8">
            <Image src="/images/logo.png" alt="OTC Exchange" width={120} height={40} className="h-8 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.path ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <GradientButton asChild variant="outline">
                <Link href="/dashboard">
                  <span>{userName}</span>
                </Link>
              </GradientButton>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <GradientButton asChild>
                <Link href="/register">
                  <span>Register Company</span>
                </Link>
              </GradientButton>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <div className="pt-2">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <GradientButton asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard">
                      <span>{userName}</span>
                    </Link>
                  </GradientButton>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                  <GradientButton asChild className="w-full">
                    <Link href="/register">Register Company</Link>
                  </GradientButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

