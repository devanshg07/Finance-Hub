"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { CategoryCard } from "@/components/category-card"
import { Settings, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  color: string
}

const initialIncomeCategories: Category[] = [
  { id: "1", name: "Salary", color: "#22c55e" },
  { id: "2", name: "Freelance", color: "#3b82f6" },
  { id: "3", name: "Investments", color: "#8b5cf6" },
]

const initialExpenseCategories: Category[] = [
  { id: "4", name: "Food & Dining", color: "#ef4444" },
  { id: "5", name: "Transportation", color: "#f97316" },
  { id: "6", name: "Shopping", color: "#ec4899" },
  { id: "7", name: "Bills & Utilities", color: "#eab308" },
]

export default function ManageCategories() {
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([])
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load user categories on component mount
  useEffect(() => {
    loadUserCategories()
  }, [])

  const loadUserCategories = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.id) {
        // If no user, use default categories
        setIncomeCategories(initialIncomeCategories)
        setExpenseCategories(initialExpenseCategories)
        setIsLoading(false)
        return
      }

      const response = await fetch(`https://finance-hub-hc1s.onrender.com/api/user-categories/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        const hasCategories = (data.incomeCategories && data.incomeCategories.length > 0) || 
                           (data.expenseCategories && data.expenseCategories.length > 0)
        
        if (hasCategories) {
          setIncomeCategories(data.incomeCategories || [])
          setExpenseCategories(data.expenseCategories || [])
        } else {
          // No categories found, create default ones
          console.log('No categories found for user, creating defaults...')
          const createResponse = await fetch(`https://finance-hub-hc1s.onrender.com/api/user-categories/${user.id}/default`, {
            method: 'POST'
          })
          
          if (createResponse.ok) {
            // Reload categories after creating defaults
            const reloadResponse = await fetch(`https://finance-hub-hc1s.onrender.com/api/user-categories/${user.id}`)
            if (reloadResponse.ok) {
              const reloadData = await reloadResponse.json()
              setIncomeCategories(reloadData.incomeCategories || [])
              setExpenseCategories(reloadData.expenseCategories || [])
            } else {
              // Fallback to initial categories
              setIncomeCategories(initialIncomeCategories)
              setExpenseCategories(initialExpenseCategories)
            }
          } else {
            // Fallback to initial categories
            setIncomeCategories(initialIncomeCategories)
            setExpenseCategories(initialExpenseCategories)
          }
        }
      } else {
        // If no saved categories, try to create defaults
        const createResponse = await fetch(`https://finance-hub-hc1s.onrender.com/api/user-categories/${user.id}/default`, {
          method: 'POST'
        })
        
        if (createResponse.ok) {
          // Reload categories after creating defaults
          const reloadResponse = await fetch(`https://finance-hub-hc1s.onrender.com/api/user-categories/${user.id}`)
          if (reloadResponse.ok) {
            const reloadData = await reloadResponse.json()
            setIncomeCategories(reloadData.incomeCategories || [])
            setExpenseCategories(reloadData.expenseCategories || [])
          } else {
            setIncomeCategories(initialIncomeCategories)
            setExpenseCategories(initialExpenseCategories)
          }
        } else {
          setIncomeCategories(initialIncomeCategories)
          setExpenseCategories(initialExpenseCategories)
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      // Use default categories on error
      setIncomeCategories(initialIncomeCategories)
      setExpenseCategories(initialExpenseCategories)
    } finally {
      setIsLoading(false)
    }
  }

  const saveCategories = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      toast({
        title: "Error",
        description: "Please log in to save categories",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const allCategories = [
        ...incomeCategories.map(cat => ({ ...cat, type: 'income' })),
        ...expenseCategories.map(cat => ({ ...cat, type: 'expense' }))
      ]

      console.log('Saving categories for user:', user.id, 'Categories:', allCategories)

      const response = await fetch('https://finance-hub-hc1s.onrender.com/api/user-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          categories: allCategories
        })
      })

      const responseData = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Categories saved successfully!",
        })
      } else {
        console.error('Server error response:', responseData)
        throw new Error(responseData.error || 'Failed to save categories')
      }
    } catch (error) {
      console.error('Error saving categories:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save categories. Please try again."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addIncomeCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
    }
    setIncomeCategories([...incomeCategories, newCategory])
  }

  const addExpenseCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
    }
    setExpenseCategories([...expenseCategories, newCategory])
  }

  const removeIncomeCategory = (id: string) => {
    setIncomeCategories(incomeCategories.filter((cat) => cat.id !== id))
  }

  const removeExpenseCategory = (id: string) => {
    setExpenseCategories(expenseCategories.filter((cat) => cat.id !== id))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading categories...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Settings Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences and categories</p>
            </div>
          </div>
        </div>

        {/* Manage Categories Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold">Manage Categories</h2>
            <Button 
              onClick={saveCategories} 
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Categories'}
            </Button>
          </div>
          <p className="text-muted-foreground mb-6">
            Organize your transactions by creating and managing income and expense categories. Categories help you
            track where your money comes from and where it goes. Click "Save Categories" to persist your changes.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
          <CategoryCard
            title="Income Categories"
            categories={incomeCategories}
            onAddCategory={addIncomeCategory}
            onRemoveCategory={removeIncomeCategory}
            type="income"
          />

          <CategoryCard
            title="Expense Categories"
            categories={expenseCategories}
            onAddCategory={addExpenseCategory}
            onRemoveCategory={removeExpenseCategory}
            type="expense"
          />
        </div>

        {/* Summary Stats */}
        <div className="mt-8 p-4 rounded-lg bg-accent/20 border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Categories:</span>
            <span className="font-medium">{incomeCategories.length + expenseCategories.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 