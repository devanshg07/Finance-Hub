"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { CategoryChart } from "@/components/category-chart"
import { ExpenseChart } from "@/components/expense-chart"
import { Plus, TrendingUp, TrendingDown, SortAsc, SortDesc, Search, Filter, ChevronDown } from "lucide-react"

interface Transaction {
  id: number
  category: string
  description: string
  amount: number
  date: string
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const addTransaction = async (transaction: {
    category: string
    description: string
    amount: number
    date: string
  }) => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: transaction.category,
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date
        })
      })

      if (response.ok) {
        const newTransaction = await response.json()
        setTransactions(prev => [newTransaction, ...prev])
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  const deleteTransaction = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTransactions(prev => prev.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  // Get unique categories for filter dropdown
  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category))).sort()

  // Filter and search transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Category filter
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory
    
    // Type filter
    const matchesType = filterType === 'all' || 
      (filterType === 'income' && transaction.amount > 0) ||
      (filterType === 'expense' && transaction.amount < 0)
    
    return matchesSearch && matchesCategory && matchesType
  })

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'date':
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime()
        break
      case 'category':
        comparison = a.category.localeCompare(b.category)
        break
      case 'amount':
        comparison = Math.abs(b.amount) - Math.abs(a.amount)
        break
    }
    return sortOrder === 'asc' ? -comparison : comparison
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Mobile-Optimized Layout */}
      <div className="p-3 sm:p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Floating Action Button - Mobile First */}
          <div className="fixed bottom-6 right-6 z-40">
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>

          {/* Summary Cards - Simplified for Mobile */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-green-700">Income</span>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </div>
              <div className="text-sm sm:text-lg font-bold text-green-600">${totalIncome.toFixed(2)}</div>
              <div className="text-xs text-green-600 mt-1">
                {transactions.filter((t) => t.amount > 0).length} transactions
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-red-700">Expenses</span>
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              </div>
              <div className="text-sm sm:text-lg font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
              <div className="text-xs text-red-600 mt-1">
                {transactions.filter((t) => t.amount < 0).length} transactions
              </div>
            </Card>
          </div>

          {/* Tabs - Mobile Optimized */}
          <Tabs defaultValue="expenses" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 p-1 h-10 sm:h-12">
              <TabsTrigger value="expenses" className="text-xs sm:text-sm font-medium">Expenses</TabsTrigger>
              <TabsTrigger value="transactions" className="text-xs sm:text-sm font-medium">Transactions</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm font-medium">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses">
              <Card className="p-3 sm:p-4">
                <div className="mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-semibold mb-1">
                    Spending Breakdown
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Track where your money goes
                  </p>
                </div>
                <CategoryChart transactions={transactions} />
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card className="p-3 sm:p-4">
                <div className="mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-semibold mb-1">
                    Recent Transactions
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    View and manage your transactions
                  </p>
                </div>
                
                {/* Enhanced Search and Filter Controls */}
                <div className="space-y-3 mb-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filter Controls */}
                  <div className="flex gap-2">
                    <Select value={filterType} onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)}>
                      <SelectTrigger className="flex-1">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expenses</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {uniqueCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Compact Sort Popup */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="px-3">
                          <SortAsc className="h-4 w-4 mr-1" />
                          Sort
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48" align="end">
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Sort by</div>
                          <div className="space-y-1">
                            <Button
                              variant={sortBy === 'date' ? 'default' : 'ghost'}
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => setSortBy('date')}
                            >
                              Date
                            </Button>
                            <Button
                              variant={sortBy === 'category' ? 'default' : 'ghost'}
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => setSortBy('category')}
                            >
                              Category
                            </Button>
                            <Button
                              variant={sortBy === 'amount' ? 'default' : 'ghost'}
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => setSortBy('amount')}
                            >
                              Amount
                            </Button>
                          </div>
                          <div className="border-t pt-2">
                            <div className="text-sm font-medium mb-1">Order</div>
                            <div className="space-y-1">
                              <Button
                                variant={sortOrder === 'desc' ? 'default' : 'ghost'}
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => setSortOrder('desc')}
                              >
                                <SortDesc className="h-4 w-4 mr-2" />
                                Descending
                              </Button>
                              <Button
                                variant={sortOrder === 'asc' ? 'default' : 'ghost'}
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => setSortOrder('asc')}
                              >
                                <SortAsc className="h-4 w-4 mr-2" />
                                Ascending
                              </Button>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Results Summary */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {sortedTransactions.length} of {transactions.length} transactions
                    </span>
                    {(searchQuery || filterCategory !== 'all' || filterType !== 'all') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('')
                          setFilterCategory('all')
                          setFilterType('all')
                        }}
                        className="text-xs"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </div>

                <TransactionList 
                  transactions={sortedTransactions} 
                  onDeleteTransaction={deleteTransaction}
                />
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-4">
                {/* Balance Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="text-center">
                      <p className="text-xs text-green-700">Income</p>
                      <p className="text-lg font-bold text-green-600">${totalIncome.toFixed(2)}</p>
                    </div>
                  </Card>
                  <Card className="p-3 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <div className="text-center">
                      <p className="text-xs text-red-700">Expenses</p>
                      <p className="text-lg font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                    </div>
                  </Card>
                  <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="text-center">
                      <p className="text-xs text-blue-700">Balance</p>
                      <p className={`text-lg font-bold ${(totalIncome - totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(totalIncome - totalExpenses).toFixed(2)}
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Expense Chart */}
                <Card className="p-3 sm:p-4">
                  <div className="mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold mb-1">
                      Monthly Expense Trends
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Track your spending over time
                    </p>
                  </div>
                  <ExpenseChart transactions={transactions} />
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <TransactionForm
              onAddTransaction={addTransaction}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}