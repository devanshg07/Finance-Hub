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

interface Categories {
  expenseDescriptions: string[]
  incomeDescriptions: string[]
}

export function TransactionForm({ onAddTransaction, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: "expense",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0]
  })

  const [categories, setCategories] = useState<Categories>({
    expenseDescriptions: [],
    incomeDescriptions: []
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch categories from backend
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to fetch categories:', err))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (!formData.category || !formData.description || !formData.amount || !formData.date) {
      alert("Please fill in all fields")
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
      description: formData.description,
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
    ? categories.expenseDescriptions 
    : categories.incomeDescriptions

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Transaction
        </CardTitle>
        <p className="text-sm text-gray-600">Record a new income or expense transaction</p>
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
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-green-600 font-medium">Income</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600 font-medium">Expense</Label>
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
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {currentCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
              placeholder="Enter transaction description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
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
