"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, Palette, Tag, Shield, Zap, Sun, Moon } from "lucide-react"

interface NavBarProps {
  isDarkMode?: boolean
  onToggleDarkMode?: () => void
}

export function NavBar({ isDarkMode = false, onToggleDarkMode }: NavBarProps) {
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
            <div className="w-8 h-8 flex items-center justify-center relative">
              {/* Custom unicorn icon using multiple elements */}
              <div className="relative">
                <div className={`w-5 h-5 rounded-full ${isDarkMode ? 'bg-purple-400' : 'bg-purple-600'}`}></div>
                <Zap className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 ${isDarkMode ? 'text-purple-300' : 'text-purple-500'}`} />
              </div>
            </div>
            <span className={`font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>FinanceHub</span>
          </div>
          <span className={`text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hidden sm:inline`}>Track your income and expenses</span>
        </div>
        
        {/* Dark Mode Toggle - Mobile Only - Centered */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:hidden">
          {onToggleDarkMode && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleDarkMode}
              className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          )}
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
              <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                <Tag className="w-4 h-4 mr-2" />
                Manage Categories
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