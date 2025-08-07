"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  color: string
}

interface UserCategories {
  incomeCategories: Category[]
  expenseCategories: Category[]
}

// Dynamic color generation based on category name hash (same as pie chart and transaction list)
const generateCategoryColor = (category: string) => {
  // Create a hash from the category name
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    const char = category.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Use the hash to generate consistent colors
  const hue = Math.abs(hash) % 360
  const saturation = 70 + (Math.abs(hash) % 20) // 70-90% saturation
  const lightness = 45 + (Math.abs(hash) % 15) // 45-60% lightness for good contrast
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export default function CategorySelection() {
  const [user, setUser] = useState<any>(null)
  const [userCategories, setUserCategories] = useState<UserCategories>({
    incomeCategories: [],
    expenseCategories: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const userObj = JSON.parse(userData)
      setUser(userObj)
      loadUserCategories()
    } else {
      // Redirect to login if no user
      window.location.href = '/'
    }
  }, [])

  const loadUserCategories = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/user-categories/${user.id}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.incomeCategories && data.expenseCategories) {
          setUserCategories(data)
        } else {
          // If no user-specific categories, create default ones
          await createDefaultCategories()
        }
      } else {
        // If user doesn't exist or error, create default categories
        await createDefaultCategories()
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback to default categories immediately
      setUserCategories({
        incomeCategories: [
          { id: 'income-1', name: 'Salary', color: generateCategoryColor('Salary') },
          { id: 'income-2', name: 'Freelance', color: generateCategoryColor('Freelance') },
          { id: 'income-3', name: 'Investment', color: generateCategoryColor('Investment') },
          { id: 'income-4', name: 'Business Income', color: generateCategoryColor('Business Income') }
        ],
        expenseCategories: [
          { id: 'expense-1', name: 'Food & Dining', color: generateCategoryColor('Food & Dining') },
          { id: 'expense-2', name: 'Transportation', color: generateCategoryColor('Transportation') },
          { id: 'expense-3', name: 'Healthcare', color: generateCategoryColor('Healthcare') },
          { id: 'expense-4', name: 'Shopping', color: generateCategoryColor('Shopping') },
          { id: 'expense-5', name: 'Entertainment', color: generateCategoryColor('Entertainment') },
          { id: 'expense-6', name: 'Rent / Mortgage', color: generateCategoryColor('Rent / Mortgage') },
          { id: 'expense-7', name: 'Utilities', color: generateCategoryColor('Utilities') },
          { id: 'expense-8', name: 'Other', color: generateCategoryColor('Other') }
        ]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createDefaultCategories = async () => {
    if (!user) return

    try {
      const response = await fetch(`http://localhost:5000/api/user-categories/${user.id}/default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserCategories(data)
      } else {
        // If backend fails, use hardcoded defaults
        setUserCategories({
          incomeCategories: [
            { id: 'income-1', name: 'Salary', color: generateCategoryColor('Salary') },
            { id: 'income-2', name: 'Freelance', color: generateCategoryColor('Freelance') },
            { id: 'income-3', name: 'Investment', color: generateCategoryColor('Investment') },
            { id: 'income-4', name: 'Business Income', color: generateCategoryColor('Business Income') }
          ],
          expenseCategories: [
            { id: 'expense-1', name: 'Food & Dining', color: generateCategoryColor('Food & Dining') },
            { id: 'expense-2', name: 'Transportation', color: generateCategoryColor('Transportation') },
            { id: 'expense-3', name: 'Healthcare', color: generateCategoryColor('Healthcare') },
            { id: 'expense-4', name: 'Shopping', color: generateCategoryColor('Shopping') },
            { id: 'expense-5', name: 'Entertainment', color: generateCategoryColor('Entertainment') },
            { id: 'expense-6', name: 'Rent / Mortgage', color: generateCategoryColor('Rent / Mortgage') },
            { id: 'expense-7', name: 'Utilities', color: generateCategoryColor('Utilities') },
            { id: 'expense-8', name: 'Other', color: generateCategoryColor('Other') }
          ]
        })
      }
    } catch (error) {
      console.error('Error creating default categories:', error)
      // Use hardcoded defaults as fallback
      setUserCategories({
        incomeCategories: [
          { id: 'income-1', name: 'Salary', color: generateCategoryColor('Salary') },
          { id: 'income-2', name: 'Freelance', color: generateCategoryColor('Freelance') },
          { id: 'income-3', name: 'Investment', color: generateCategoryColor('Investment') },
          { id: 'income-4', name: 'Business Income', color: generateCategoryColor('Business Income') }
        ],
        expenseCategories: [
          { id: 'expense-1', name: 'Food & Dining', color: generateCategoryColor('Food & Dining') },
          { id: 'expense-2', name: 'Transportation', color: generateCategoryColor('Transportation') },
          { id: 'expense-3', name: 'Healthcare', color: generateCategoryColor('Healthcare') },
          { id: 'expense-4', name: 'Shopping', color: generateCategoryColor('Shopping') },
          { id: 'expense-5', name: 'Entertainment', color: generateCategoryColor('Entertainment') },
          { id: 'expense-6', name: 'Rent / Mortgage', color: generateCategoryColor('Rent / Mortgage') },
          { id: 'expense-7', name: 'Utilities', color: generateCategoryColor('Utilities') },
          { id: 'expense-8', name: 'Other', color: generateCategoryColor('Other') }
        ]
      })
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
      // Convert the categories object to a flat array as expected by the backend
      const categoriesArray = [
        ...userCategories.incomeCategories.map(cat => ({ ...cat, type: 'income' })),
        ...userCategories.expenseCategories.map(cat => ({ ...cat, type: 'expense' }))
      ]

      const response = await fetch('http://localhost:5000/api/user-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          categories: categoriesArray // Sending as a flat array
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Categories saved successfully!",
        })
        window.location.href = '/dashboard' // Redirect to dashboard
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Button 
            size="lg"
            className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold"
            onClick={() => {
              setIsLoading(false)
              setUserCategories({
                incomeCategories: [
                  { id: 'income-1', name: 'Salary', color: generateCategoryColor('Salary') },
                  { id: 'income-2', name: 'Freelance', color: generateCategoryColor('Freelance') },
                  { id: 'income-3', name: 'Investment', color: generateCategoryColor('Investment') },
                  { id: 'income-4', name: 'Business Income', color: generateCategoryColor('Business Income') }
                ],
                expenseCategories: [
                  { id: 'expense-1', name: 'Food & Dining', color: generateCategoryColor('Food & Dining') },
                  { id: 'expense-2', name: 'Transportation', color: generateCategoryColor('Transportation') },
                  { id: 'expense-3', name: 'Healthcare', color: generateCategoryColor('Healthcare') },
                  { id: 'expense-4', name: 'Shopping', color: generateCategoryColor('Shopping') },
                  { id: 'expense-5', name: 'Entertainment', color: generateCategoryColor('Entertainment') },
                  { id: 'expense-6', name: 'Rent / Mortgage', color: generateCategoryColor('Rent / Mortgage') },
                  { id: 'expense-7', name: 'Utilities', color: generateCategoryColor('Utilities') },
                  { id: 'expense-8', name: 'Other', color: generateCategoryColor('Other') }
                ]
              })
            }}
          >
            GO!
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to FinanceHub!</h1>
            <p className="text-muted-foreground text-sm sm:text-base px-4">
              Let's set up your income and expense categories to get started.
            </p>
          </div>

          <Card className="mx-2 sm:mx-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Choose Your Categories</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select or customize your income and expense categories. You can always change these later in settings.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              {/* Income Categories */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Label className="text-base sm:text-lg font-semibold text-green-600">Income Categories</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCategory('income')}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                </div>
                
                <div className="grid gap-3">
                  {userCategories.incomeCategories.map((category, index) => (
                    <div key={category.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div 
                          className="w-5 h-5 rounded-full cursor-pointer flex-shrink-0"
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
                          className="flex-1 min-w-0"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory('income', index)}
                        className="text-red-500 hover:text-red-700 self-end sm:self-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Categories */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Label className="text-base sm:text-lg font-semibold text-red-600">Expense Categories</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCategory('expense')}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                </div>
                
                <div className="grid gap-3">
                  {userCategories.expenseCategories.map((category, index) => (
                    <div key={category.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div 
                          className="w-5 h-5 rounded-full cursor-pointer flex-shrink-0"
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
                          className="flex-1 min-w-0"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory('expense', index)}
                        className="text-red-500 hover:text-red-700 self-end sm:self-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                  Total Categories: {userCategories.incomeCategories.length + userCategories.expenseCategories.length}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-1 sm:order-2">
                  <Button 
                    variant="outline" 
                    onClick={skipCategories}
                    className="w-full sm:w-auto"
                  >
                    Skip for Now
                  </Button>
                  <Button 
                    onClick={saveCategories} 
                    disabled={isSaving} 
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
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