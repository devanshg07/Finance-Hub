"use client"

import { useState, useEffect } from "react"
import { Zap, Settings, Moon, Sun, ArrowLeft, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isSettingsPage = mounted && window.location.pathname === '/settings'
  const isDashboardPage = mounted && window.location.pathname === '/dashboard'

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {!isDashboardPage && (
            <>
              <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => window.location.href = '/dashboard'}>
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
            </>
          )}
          <div className="flex items-center gap-2">
            {/* Custom unicorn icon */}
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-purple-600"></div>
              <Zap className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 text-purple-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FinanceHub</h1>
              <p className="hidden sm:block text-sm text-muted-foreground">Track your income and expenses</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isSettingsPage ? (
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                localStorage.removeItem('user')
                window.location.href = '/'
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    localStorage.removeItem('user')
                    window.location.href = '/'
                  }}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
} 