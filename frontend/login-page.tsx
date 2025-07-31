"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, TrendingUp, Shield, Lock, Loader2, ArrowRight, Sun, Moon } from "lucide-react"

export default function Component() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const [isDarkMode, setIsDarkMode] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' }) // 'success' or 'error'

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ text: '', type: '' })

    try {
      const response = await fetch('https://finance-hub-hc1s.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      })

      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user))
        window.location.href = '/categories'
      } else {
        setMessage({ text: data.error || 'Login failed', type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ text: '', type: '' })

    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('https://finance-hub-hc1s.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: `${formData.firstName} ${formData.lastName}`, email: formData.email, password: formData.password }),
      })

      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user))
        window.location.href = '/categories'
      } else {
        setMessage({ text: data.error || 'Registration failed', type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setMessage({ text: '', type: '' }) // Clear any existing messages
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    })
  }

  if (!mounted) return null

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
      }`}
    >
      {/* Theme Toggle Button */}
      <Button
        onClick={toggleTheme}
        variant="outline"
        size="sm"
        className={`fixed top-4 right-4 z-20 ${
          isDarkMode
            ? "bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50"
            : "bg-white/50 border-slate-300 text-slate-900 hover:bg-white/70"
        } backdrop-blur-xl transition-all duration-300 hover:scale-110`}
      >
        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse ${
            isDarkMode
              ? "bg-gradient-to-br from-blue-500/20 to-purple-600/20"
              : "bg-gradient-to-br from-blue-500/10 to-purple-600/10"
          }`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 ${
            isDarkMode
              ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20"
              : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10"
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500 ${
            isDarkMode
              ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10"
              : "bg-gradient-to-br from-purple-500/5 to-pink-500/5"
          }`}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section with animation */}
        <div
          className={`text-center mb-8 transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-2xl hover:scale-110 transition-transform duration-300 ${
              isDarkMode
                ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700"
                : "bg-gradient-to-br from-white to-slate-100 border border-slate-200"
            }`}
          >
            <TrendingUp className={`w-8 h-8 animate-pulse ${isDarkMode ? "text-white" : "text-slate-900"}`} />
          </div>
          <h1
            className={`text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
              isDarkMode ? "from-white to-slate-300" : "from-slate-900 to-slate-600"
            }`}
          >
            FinanceHub
          </h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>Secure financial management</p>
        </div>

        <Card
          className={`shadow-2xl backdrop-blur-xl transition-all duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          } ${isDarkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-white/50"}`}
        >
          <CardHeader className="space-y-1 pb-4">
            <CardTitle
              className={`text-2xl font-semibold text-center ${isDarkMode ? "text-white" : "text-slate-900"} transition-all duration-500`}
            >
              {isLogin ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription className={`text-center ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              {isLogin
                ? "Sign in to access your financial dashboard"
                : "Join thousands of users managing their finances securely"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
              {/* Message Display */}
              {message.text && (
                <div
                  className={`p-3 rounded-md text-sm font-medium transition-all duration-300 ${
                    message.type === 'success'
                      ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
                  }`}
                >
                  {message.text}
                </div>
              )}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top duration-500">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`transition-all duration-300 ${
                        isDarkMode
                          ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 hover:bg-slate-700/70"
                          : "bg-white/50 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-400 hover:bg-white/70"
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`transition-all duration-300 ${
                        isDarkMode
                          ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 hover:bg-slate-700/70"
                          : "bg-white/50 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-400 hover:bg-white/70"
                      }`}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`transition-all duration-300 ${
                    isDarkMode
                      ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 hover:bg-slate-700/70"
                      : "bg-white/50 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-400 hover:bg-white/70"
                  }`}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`transition-all duration-300 ${
                      isDarkMode
                        ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 hover:bg-slate-700/70"
                        : "bg-white/50 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-400 hover:bg-white/70"
                    } pr-10`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-white transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2 animate-in slide-in-from-top duration-500">
                  <Label htmlFor="confirmPassword" className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`transition-all duration-300 ${
                        isDarkMode
                          ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 hover:bg-slate-700/70"
                          : "bg-white/50 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-400 hover:bg-white/70"
                      } pr-10`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-white transition-colors duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      className="border-slate-600 data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                    <Label htmlFor="remember" className="text-sm font-normal text-slate-300">
                      Remember me
                    </Label>
                  </div>
                  <Button
                    variant="link"
                    className="px-0 font-normal text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    Forgot password?
                  </Button>
                </div>
              )}

              {!isLogin && (
                <div className="flex items-center space-x-2 animate-in slide-in-from-top duration-500">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    className="border-slate-600 data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                  <Label htmlFor="terms" className="text-sm font-normal text-slate-300">
                    I agree to the{" "}
                    <Button
                      variant="link"
                      className="px-0 h-auto font-normal text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      Terms of Service
                    </Button>{" "}
                    and{" "}
                    <Button
                      variant="link"
                      className="px-0 h-auto font-normal text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      Privacy Policy
                    </Button>
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group ${
                  isDarkMode
                    ? "bg-black hover:bg-slate-900 border border-slate-700 hover:border-slate-600"
                    : "bg-slate-900 hover:bg-black border border-slate-300 hover:border-slate-400"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign in" : "Create account"}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="flex items-center justify-center space-x-4 text-sm text-slate-400">
              <div className="flex items-center space-x-1 hover:text-white transition-colors duration-200">
                <Shield className="w-4 h-4" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-white transition-colors duration-200">
                <Lock className="w-4 h-4" />
                <span>256-bit encryption</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-sm text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>{" "}
              <Button
                variant="link"
                className="px-0 font-normal text-slate-300 hover:text-white transition-colors duration-200"
                onClick={toggleMode}
              >
                {isLogin ? "Create account" : "Sign in"}
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div
          className={`mt-8 text-center text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"} transition-all duration-1000 delay-300 ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <p>Protected by industry-standard security measures</p>
          <p className="mt-1">© 2024 FinanceHub. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
