"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, Palette, Tag, Shield, TrendingUp } from "lucide-react"

interface NavBarProps {
  isDarkMode?: boolean
}

export function NavBar({ isDarkMode = false }: NavBarProps) {
  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <div className={`border-b px-4 py-3 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="max-w-6xl mx-auto flex items-center relative">
        {/* Logo and Slogan */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <TrendingUp className={`w-5 h-5 transition-colors duration-200 ${isDarkMode ? 'text-black' : 'text-gray-600'}`} />
            </div>
            <span className={`font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>FinanceHub</span>
          </div>
          <span className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Track your income and expenses</span>
        </div>
        {/* Profile Button absolutely right */}
        <div className="ml-auto absolute right-0 top-1/2 -translate-y-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={`flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'}`}>
                <User className="w-4 h-4" />
                Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Tag className="w-4 h-4 mr-2" />
                Manage Categories
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Palette className="w-4 h-4 mr-2" />
                Theme Preferences
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                App Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Shield className="w-4 h-4 mr-2" />
                Privacy & Security
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 