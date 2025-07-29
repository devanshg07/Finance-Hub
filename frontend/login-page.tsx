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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        // Login API call
        const response = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          console.log('Login successful:', data)
          // Store user data in localStorage or state management
          localStorage.setItem('user', JSON.stringify(data.user))
          setMessage({ text: 'Login successful!', type: 'success' })
          // You can redirect to dashboard here
        } else {
          setMessage({ text: data.error || 'Login failed', type: 'error' })
        }
      } else {
        // Register API call
        if (formData.password !== formData.confirmPassword) {
          setMessage({ text: 'Passwords do not match', type: 'error' })
          setIsLoading(false)
          return
        }

        const response = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            password: formData.password,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          console.log('Registration successful:', data)
          setMessage({ text: 'Registration successful! Please login.', type: 'success' })
          setIsLogin(true)
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            agreeToTerms: false,
          })
        } else {
          setMessage({ text: data.error || 'Registration failed', type: 'error' })
        }
      }
    } catch (error) {
      console.error('API Error:', error)
      setMessage({ text: 'Network error. Please try again.', type: 'error' })
    }

    setIsLoading(false)
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
            <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className={`w-full ${isDarkMode ? "bg-slate-700" : "bg-slate-300"}`} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`px-2 ${isDarkMode ? "bg-slate-800 text-slate-400" : "bg-white text-slate-600"}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className={`w-full transition-all duration-300 hover:scale-[1.02] ${
                  isDarkMode
                    ? "bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    : "bg-white/30 border-slate-300 text-slate-700 hover:bg-white/50 hover:text-slate-900"
                }`}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className={`w-full transition-all duration-300 hover:scale-[1.02] ${
                  isDarkMode
                    ? "bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    : "bg-white/30 border-slate-300 text-slate-700 hover:bg-white/50 hover:text-slate-900"
                }`}
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                </svg>
                Apple
              </Button>
            </div>
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
