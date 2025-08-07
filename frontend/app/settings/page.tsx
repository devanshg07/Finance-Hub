"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { CategoryCard } from "@/components/category-card"
import { Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  color: string
}

// Dynamic color generation based on category name hash (same as dropdown)
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

const defaultIncomeCategories: Category[] = [
  { id: "income-1", name: "Salary", color: generateCategoryColor('Salary') },
  { id: "income-2", name: "Freelance", color: generateCategoryColor('Freelance') },
  { id: "income-3", name: "Investment", color: generateCategoryColor('Investment') },
  { id: "income-4", name: "Business Income", color: generateCategoryColor('Business Income') }
]

const defaultExpenseCategories: Category[] = [
  { id: "expense-1", name: "Food & Dining", color: generateCategoryColor('Food & Dining') },
  { id: "expense-2", name: "Transportation", color: generateCategoryColor('Transportation') },
  { id: "expense-3", name: "Healthcare", color: generateCategoryColor('Healthcare') },
  { id: "expense-4", name: "Shopping", color: generateCategoryColor('Shopping') },
  { id: "expense-5", name: "Entertainment", color: generateCategoryColor('Entertainment') },
  { id: "expense-6", name: "Rent / Mortgage", color: generateCategoryColor('Rent / Mortgage') },
  { id: "expense-7", name: "Utilities", color: generateCategoryColor('Utilities') },
  { id: "expense-8", name: "Other", color: generateCategoryColor('Other') }
]

export default function ManageCategories() {
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([])
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load user categories on component mount
  useEffect(() => {
    loadUserCategories()
  }, [])

  const loadUserCategories = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.id) {
        // If no user, use default categories
        setIncomeCategories(defaultIncomeCategories)
        setExpenseCategories(defaultExpenseCategories)
        setIsLoading(false)
        return
      }

      const response = await fetch(`http://localhost:5000/api/user-categories/${user.id}`)
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
          const createResponse = await fetch(`http://localhost:5000/api/user-categories/${user.id}/default`, {
            method: 'POST'
          })
          
          if (createResponse.ok) {
            // Reload categories after creating defaults
            const reloadResponse = await fetch(`http://localhost:5000/api/user-categories/${user.id}`)
            if (reloadResponse.ok) {
              const reloadData = await reloadResponse.json()
              setIncomeCategories(reloadData.incomeCategories || [])
              setExpenseCategories(reloadData.expenseCategories || [])
            } else {
              // Fallback to default categories
              setIncomeCategories(defaultIncomeCategories)
              setExpenseCategories(defaultExpenseCategories)
            }
          } else {
            // Fallback to default categories
            setIncomeCategories(defaultIncomeCategories)
            setExpenseCategories(defaultExpenseCategories)
          }
        }
      } else {
        // If no saved categories, try to create defaults
        const createResponse = await fetch(`http://localhost:5000/api/user-categories/${user.id}/default`, {
          method: 'POST'
        })
        
        if (createResponse.ok) {
          // Reload categories after creating defaults
          const reloadResponse = await fetch(`http://localhost:5000/api/user-categories/${user.id}`)
          if (reloadResponse.ok) {
            const reloadData = await reloadResponse.json()
            setIncomeCategories(reloadData.incomeCategories || [])
            setExpenseCategories(reloadData.expenseCategories || [])
          } else {
            setIncomeCategories(defaultIncomeCategories)
            setExpenseCategories(defaultExpenseCategories)
          }
        } else {
          setIncomeCategories(defaultIncomeCategories)
          setExpenseCategories(defaultExpenseCategories)
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback to default categories
      setIncomeCategories(defaultIncomeCategories)
      setExpenseCategories(defaultExpenseCategories)
    } finally {
      setIsLoading(false)
    }
  }



  const addIncomeCategory = async (name: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
    }
    const updatedCategories = [...incomeCategories, newCategory]
    setIncomeCategories(updatedCategories)
    
    // Auto-save
    await saveCategoriesToBackend(updatedCategories, expenseCategories)
  }

  const addExpenseCategory = async (name: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
    }
    const updatedCategories = [...expenseCategories, newCategory]
    setExpenseCategories(updatedCategories)
    
    // Auto-save
    await saveCategoriesToBackend(incomeCategories, updatedCategories)
  }

  const removeIncomeCategory = async (id: string) => {
    const updatedCategories = incomeCategories.filter((cat) => cat.id !== id)
    setIncomeCategories(updatedCategories)
    
    // Auto-save
    await saveCategoriesToBackend(updatedCategories, expenseCategories)
  }

  const removeExpenseCategory = async (id: string) => {
    const updatedCategories = expenseCategories.filter((cat) => cat.id !== id)
    setExpenseCategories(updatedCategories)
    
    // Auto-save
    await saveCategoriesToBackend(incomeCategories, updatedCategories)
  }

  // Helper function to save categories to backend
  const saveCategoriesToBackend = async (incomeCats: Category[], expenseCats: Category[]) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.id) {
        return
      }

      const categoriesArray = [
        ...incomeCats.map(cat => ({ ...cat, type: 'income' })),
        ...expenseCats.map(cat => ({ ...cat, type: 'expense' }))
      ]

      await fetch('https://finance-hub-hc1s.onrender.com/api/user-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          categories: categoriesArray
        })
      })
    } catch (error) {
      console.error('Error auto-saving categories:', error)
    }
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
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* Manage Categories Section */}
          <div className="mb-6">
                      <div className="mb-2">
            <h2 className="text-2xl font-semibold">Manage Categories</h2>
          </div>
            <p className="text-muted-foreground mb-6">
              Organize your transactions by creating and managing income and expense categories. Categories help you
              track where your money comes from and where it goes. Changes are automatically saved.
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

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="max-w-2xl mx-auto">
            
            {/* Header Section - Centered */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-3">Manage Categories</h2>
              <p className="text-sm text-muted-foreground mb-4 px-4">
                Organize your transactions by creating and managing income and expense categories. Changes are automatically saved.
              </p>
            </div>

            {/* Categories - Single Column on Mobile */}
            <div className="space-y-6">
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

            {/* Summary Stats - Centered */}
            <div className="mt-8 p-4 rounded-lg bg-accent/20 border text-center">
              <div className="text-sm">
                <span className="text-muted-foreground">Total Categories: </span>
                <span className="font-bold text-lg">{incomeCategories.length + expenseCategories.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 