"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, TrendingUp, Loader2, ArrowRight } from "lucide-react"

export default function Component() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (field: string, value: string) => {
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

    try {
      const response = await fetch('https://finance-hub-hc1s.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.name, email: formData.email, password: formData.password }),
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
    setMessage({ text: '', type: '' })
    setFormData({
      name: "",
      email: "",
      password: "",
    })
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-white shadow-lg">
            <TrendingUp className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            FinanceHub
          </h1>
          <p className="text-slate-600">Secure financial management</p>
        </div>

        <Card className="shadow-lg bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-slate-900">
              {isLogin ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription className="text-center text-slate-600">
              {isLogin ? "Sign in to your account" : "Join FinanceHub"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
              {/* Message Display */}
              {message.text && (
                <div
                  className={`p-3 rounded-md text-sm font-medium ${
                    message.type === 'success'
                      ? 'bg-green-100 border border-green-200 text-green-700'
                      : 'bg-red-100 border border-red-200 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Name field - only for registration */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-400"
                    required
                  />
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-400"
                  required
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-400 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign in" : "Create account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <div className="px-6 pb-6 text-center">
            <span className="text-sm text-slate-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>{" "}
            <Button
              variant="link"
              className="px-0 font-normal text-slate-900 hover:text-slate-700"
              onClick={toggleMode}
            >
              {isLogin ? "Create account" : "Sign in"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
