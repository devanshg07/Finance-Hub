"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  color: string
}

interface UserCategories {
  incomeCategories: Category[]
  expenseCategories: Category[]
}

export default function CategorySelection() {
  const [userCategories, setUserCategories] = useState<UserCategories>({
    incomeCategories: [],
    expenseCategories: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const userObj = JSON.parse(userData)
      setUser(userObj)
      loadUserCategories(userObj.id)
    } else {
      // Redirect to login if no user
      window.location.href = '/'
    }
  }, [])

  const loadUserCategories = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-categories/${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.incomeCategories && data.expenseCategories) {
          setUserCategories(data)
        } else {
          // Create default categories if none exist
          await createDefaultCategories(userId)
        }
      } else {
        // Create default categories if no saved categories
        await createDefaultCategories(userId)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      // Create default categories as fallback
      if (user) {
        await createDefaultCategories(user.id)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const createDefaultCategories = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-categories/${userId}/default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserCategories(data)
      }
    } catch (error) {
      console.error('Error creating default categories:', error)
    }
  }

  const addCategory = (type: 'income' | 'expense') => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: '',
      color: type === 'income' ? '#22c55e' : '#ef4444'
    }

    if (type === 'income') {
      setUserCategories(prev => ({
        ...prev,
        incomeCategories: [...prev.incomeCategories, newCategory]
      }))
    } else {
      setUserCategories(prev => ({
        ...prev,
        expenseCategories: [...prev.expenseCategories, newCategory]
      }))
    }
  }

  const updateCategory = (type: 'income' | 'expense', index: number, field: 'name' | 'color', value: string) => {
    if (type === 'income') {
      setUserCategories(prev => ({
        ...prev,
        incomeCategories: prev.incomeCategories.map((cat, i) => 
          i === index ? { ...cat, [field]: value } : cat
        )
      }))
    } else {
      setUserCategories(prev => ({
        ...prev,
        expenseCategories: prev.expenseCategories.map((cat, i) => 
          i === index ? { ...cat, [field]: value } : cat
        )
      }))
    }
  }

  const removeCategory = (type: 'income' | 'expense', index: number) => {
    if (type === 'income') {
      setUserCategories(prev => ({
        ...prev,
        incomeCategories: prev.incomeCategories.filter((_, i) => i !== index)
      }))
    } else {
      setUserCategories(prev => ({
        ...prev,
        expenseCategories: prev.expenseCategories.filter((_, i) => i !== index)
      }))
    }
  }

  const saveCategories = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const response = await fetch('http://localhost:5000/api/user-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          categories: {
            incomeCategories: userCategories.incomeCategories,
            expenseCategories: userCategories.expenseCategories
          }
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Categories saved successfully!",
        })
        // Redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        throw new Error('Failed to save categories')
      }
    } catch (error) {
      console.error('Error saving categories:', error)
      toast({
        title: "Error",
        description: "Failed to save categories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const skipCategories = () => {
    // Redirect to dashboard without saving categories
    window.location.href = '/dashboard'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to FinanceHub!</h1>
            <p className="text-muted-foreground">
              Let's set up your income and expense categories to get started.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Choose Your Categories</CardTitle>
              <CardDescription>
                Select or customize your income and expense categories. You can always change these later in settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Income Categories */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-green-600">Income Categories</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCategory('income')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                </div>
                
                <div className="grid gap-3">
                  {userCategories.incomeCategories.map((category, index) => (
                    <div key={category.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div 
                        className="w-4 h-4 rounded-full cursor-pointer"
                        style={{ backgroundColor: category.color }}
                        onClick={() => {
                          const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981']
                          const currentIndex = colors.indexOf(category.color)
                          const nextColor = colors[(currentIndex + 1) % colors.length]
                          updateCategory('income', index, 'color', nextColor)
                        }}
                      />
                      <Input
                        value={category.name}
                        onChange={(e) => updateCategory('income', index, 'name', e.target.value)}
                        placeholder="Category name"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory('income', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Categories */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-red-600">Expense Categories</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCategory('expense')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                </div>
                
                <div className="grid gap-3">
                  {userCategories.expenseCategories.map((category, index) => (
                    <div key={category.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div 
                        className="w-4 h-4 rounded-full cursor-pointer"
                        style={{ backgroundColor: category.color }}
                        onClick={() => {
                          const colors = ['#ef4444', '#f97316', '#ec4899', '#eab308', '#dc2626', '#7c3aed']
                          const currentIndex = colors.indexOf(category.color)
                          const nextColor = colors[(currentIndex + 1) % colors.length]
                          updateCategory('expense', index, 'color', nextColor)
                        }}
                      />
                      <Input
                        value={category.name}
                        onChange={(e) => updateCategory('expense', index, 'name', e.target.value)}
                        placeholder="Category name"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory('expense', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6">
                <div className="text-sm text-muted-foreground">
                  Total Categories: {userCategories.incomeCategories.length + userCategories.expenseCategories.length}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={skipCategories}>
                    Skip for Now
                  </Button>
                  <Button onClick={saveCategories} disabled={isSaving} className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save & Continue'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 