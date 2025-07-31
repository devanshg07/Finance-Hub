"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { CategoryChart } from "@/components/category-chart"
import { ExpenseChart } from "@/components/expense-chart"
import { Plus, TrendingUp, TrendingDown, SortAsc, SortDesc } from "lucide-react"

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

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('https://finance-hub-hc1s.onrender.com/api/tasks')
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
      const response = await fetch('https://finance-hub-hc1s.onrender.com/api/tasks', {
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
      const response = await fetch(`https://finance-hub-hc1s.onrender.com/api/tasks/${id}`, {
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

  const sortedTransactions = [...transactions].sort((a, b) => {
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
              className="h-14 w-14 rounded-full shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>

          {/* Summary Cards - Simplified for Mobile */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Income</span>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </div>
              <div className="text-sm sm:text-lg font-bold text-green-600">${totalIncome.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {transactions.filter((t) => t.amount > 0).length} transactions
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Expenses</span>
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              </div>
              <div className="text-sm sm:text-lg font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
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
                
                {/* Mobile-Optimized Controls */}
                <div className="flex flex-col gap-3 mb-4">
                  <Select value={sortBy} onValueChange={(value: 'date' | 'category' | 'amount') => setSortBy(value)}>
                    <SelectTrigger className="w-full">
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
                    className="flex items-center gap-2"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </Button>
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
                  <Card className="p-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Income</p>
                      <p className="text-lg font-bold text-green-600">${totalIncome.toFixed(2)}</p>
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Expenses</p>
                      <p className="text-lg font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Balance</p>
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