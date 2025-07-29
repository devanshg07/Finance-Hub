"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar } from "lucide-react"

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

  useEffect(() => {
    loadUserCategories()
  }, [])

  const loadUserCategories = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.id) {
        // If no user logged in, use default categories
        const response = await fetch('http://localhost:5000/api/categories')
        const data = await response.json()
        setUserCategories({
          incomeCategories: data.incomeDescriptions.map((name: string, index: number) => ({
            id: `default-income-${index}`,
            name,
            color: '#22c55e'
          })),
          expenseCategories: data.expenseDescriptions.map((name: string, index: number) => ({
            id: `default-expense-${index}`,
            name,
            color: '#ef4444'
          }))
        })
        return
      }

      const response = await fetch(`http://localhost:5000/api/user-categories/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserCategories({
          incomeCategories: data.incomeCategories || [],
          expenseCategories: data.expenseCategories || []
        })
      } else {
        // Fallback to default categories if no user categories found
        const defaultResponse = await fetch('http://localhost:5000/api/categories')
        const defaultData = await defaultResponse.json()
        setUserCategories({
          incomeCategories: defaultData.incomeDescriptions.map((name: string, index: number) => ({
            id: `default-income-${index}`,
            name,
            color: '#22c55e'
          })),
          expenseCategories: defaultData.expenseDescriptions.map((name: string, index: number) => ({
            id: `default-expense-${index}`,
            name,
            color: '#ef4444'
          }))
        })
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      // Use empty arrays on error
      setUserCategories({
        incomeCategories: [],
        expenseCategories: []
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Transaction
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                <Label htmlFor="income" className="text-green-600">Income</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600">Expense</Label>
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
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {currentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Adding..." : "Add Transaction"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
