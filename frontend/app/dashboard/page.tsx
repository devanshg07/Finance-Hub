"use client"

import { useState, useEffect } from "react"
import { Plus, TrendingUp, TrendingDown, DollarSign, SortAsc, SortDesc, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { ExpenseChart } from "@/components/expense-chart"
import { CategoryChart } from "@/components/category-chart"
import { NavBar } from "@/components/nav-bar"

export interface Transaction {
  id: number
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
}

// Define the backend task type
type BackendTask = {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
  user?: string;
};

export default function FinancialTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isDarkMode, setIsDarkMode] = useState(false)

  const API_URL = 'http://localhost:5000/api'; // Updated API URL

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Apply dark mode classes to body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`)
      if (response.ok) {
        const data = await response.json()
        // Transform backend data to match frontend format
        const transformedData = (data as BackendTask[]).map((task) => ({
          id: task.id,
          type: (task.amount < 0 ? 'expense' : 'income') as "income" | "expense",
          amount: Math.abs(task.amount),
          category: task.category, // Use the actual category field
          description: task.description || '', // Use the actual description field
          date: task.date
        }))
        setTransactions(transformedData)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load transactions from backend on mount
  useEffect(() => {
    fetchTransactions()
  }, [])

  const addTransaction = async (transaction: {
    category: string
    description: string
    amount: number
    date: string
  }) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: transaction.category,
          description: transaction.description || '', // Allow empty description
          amount: transaction.amount,
          date: transaction.date,
          user: 'default'
        }),
      })

      if (response.ok) {
        const newTask = await response.json()
        const newTransaction: Transaction = {
          id: newTask.id,
          type: transaction.amount < 0 ? 'expense' : 'income',
          amount: Math.abs(transaction.amount),
          category: transaction.category, // Use the actual category
          description: transaction.description || '', // Use the actual description
          date: transaction.date
        }
        setTransactions(prev => [newTransaction, ...prev])
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  const deleteTransaction = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTransactions(prev => prev.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  // Calculate totals
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // Sort transactions based on current sort settings
  const sortedTransactions = [...transactions].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case 'category':
        // First sort by transaction type (income above expenses)
        if (a.type !== b.type) {
          comparison = a.type === 'income' ? -1 : 1
        } else {
          // Then sort by category name alphabetically
          comparison = a.category.localeCompare(b.category)
        }
        break
      case 'amount':
        comparison = a.amount - b.amount
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-900 dark:text-gray-100">Loading...</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <NavBar isDarkMode={isDarkMode} />
      <div className="p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleDarkMode}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${balance.toFixed(2)}
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  {balance >= 0 ? "Positive balance" : "Negative balance"}
                </p>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  {transactions.filter((t) => t.type === "income").length} transactions
                </p>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  {transactions.filter((t) => t.type === "expense").length} transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList className={`grid w-full grid-cols-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>Recent Transactions</CardTitle>
                      <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        View and manage your income and expense transactions
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={sortBy} onValueChange={(value: 'date' | 'category' | 'amount') => setSortBy(value)}>
                        <SelectTrigger className={`w-32 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="amount">Amount</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className={`flex items-center gap-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : ''}`}
                      >
                        {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <TransactionList transactions={sortedTransactions} onDeleteTransaction={deleteTransaction} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>Expense Trends</CardTitle>
                  <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Monthly breakdown of your expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpenseChart transactions={transactions} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>Spending by Category</CardTitle>
                  <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    See where your money goes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryChart transactions={transactions} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Transaction Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className={`rounded-lg max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <TransactionForm 
                  onAddTransaction={addTransaction} 
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 