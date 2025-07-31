"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, ChevronDown } from "lucide-react"

interface TransactionFormProps {
  onAddTransaction: (transaction: {
    category: string
    description: string
    amount: number
    date: string
  }) => void
  onCancel?: () => void
}

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

export function TransactionForm({ onAddTransaction, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: "expense",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0]
  })

  const [userCategories, setUserCategories] = useState<UserCategories>({
    incomeCategories: [],
    expenseCategories: []
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  useEffect(() => {
    loadUserCategories()
  }, [])

  const loadUserCategories = async () => {
    try {
      // First try to get user-specific categories
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      if (user.id) {
        const response = await fetch(`https://finance-hub-hc1s.onrender.com/api/user-categories/${user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.incomeCategories && data.expenseCategories) {
            setUserCategories(data)
            return
          }
        }
      }
      
      // Fallback to default categories
      const defaultResponse = await fetch('https://finance-hub-hc1s.onrender.com/api/categories')
      if (defaultResponse.ok) {
        const defaultData = await defaultResponse.json()
        setUserCategories({
          incomeCategories: defaultData.incomeDescriptions.map((desc: string, index: number) => ({
            id: `income-${index}`,
            name: desc,
            color: generateCategoryColor(desc)
          })),
          expenseCategories: defaultData.expenseDescriptions.map((desc: string, index: number) => ({
            id: `expense-${index}`,
            name: desc,
            color: generateCategoryColor(desc)
          }))
        })
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback to hardcoded categories if backend is not available
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (!formData.category || !formData.amount || !formData.date) {
      alert("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount)) {
      alert("Please enter a valid amount")
      setIsLoading(false)
      return
    }

    // Convert amount to negative for expenses
    const finalAmount = formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount)

    onAddTransaction({
      category: formData.category,
      description: formData.description || '', // Allow empty description
      amount: finalAmount,
      date: formData.date
    })

    // Reset form
    setFormData({
      type: "expense",
      category: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split('T')[0]
    })
    setIsLoading(false)
  }

  const currentCategories = formData.type === 'expense' 
    ? userCategories.expenseCategories 
    : userCategories.incomeCategories

  // Close dropdown when transaction type changes
  useEffect(() => {
    setIsCategoryOpen(false)
    setFormData(prev => ({ ...prev, category: "" }))
  }, [formData.type])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Plus className="w-5 h-5" />
          Add Transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => {
                setFormData({ ...formData, type: value, category: "" })
              }}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-green-600 text-sm">Income</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600 text-sm">Expense</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="w-full"
            />
          </div>

          {/* Category - Dynamic Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="category">
              {formData.type === 'income' ? 'Income' : 'Expense'} Category
            </Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between bg-white"
              >
                <span className={formData.category ? "text-gray-900" : "text-gray-500"}>
                  {formData.category || `Select ${formData.type === 'income' ? 'income' : 'expense'} category`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCategoryOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {currentCategories.length > 0 ? (
                    currentCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: category.name })
                          setIsCategoryOpen(false)
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                      >
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: generateCategoryColor(category.name) }}
                        />
                        <span className="truncate">{category.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      No {formData.type === 'income' ? 'income' : 'expense'} categories available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Adding..." : "Add Transaction"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
