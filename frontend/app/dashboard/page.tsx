"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NavBar } from "@/components/nav-bar"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { CategoryChart } from "@/components/category-chart"
import { ExpenseChart } from "@/components/expense-chart"
import { Plus, TrendingUp, TrendingDown, Sun, Moon, SortAsc, SortDesc } from "lucide-react"

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
  const [isDarkMode, setIsDarkMode] = useState(false)
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
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
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <NavBar isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
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
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-3 sm:p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Income</span>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </div>
              <div className="text-sm sm:text-lg font-bold text-green-600">${totalIncome.toFixed(2)}</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                {transactions.filter((t) => t.amount > 0).length} transactions
              </div>
            </Card>

            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-3 sm:p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Expenses</span>
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              </div>
              <div className="text-sm sm:text-lg font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                {transactions.filter((t) => t.amount < 0).length} transactions
              </div>
            </Card>
          </div>

          {/* Tabs - Mobile Optimized */}
          <Tabs defaultValue="expenses" className="space-y-4">
            <TabsList className={`grid w-full grid-cols-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-1 h-10 sm:h-12`}>
              <TabsTrigger value="expenses" className="text-xs sm:text-sm font-medium">Expenses</TabsTrigger>
              <TabsTrigger value="transactions" className="text-xs sm:text-sm font-medium">Transactions</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm font-medium">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses">
              <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-3 sm:p-4`}>
                <div className="mb-3 sm:mb-4">
                  <h2 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Spending Breakdown
                  </h2>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Track where your money goes
                  </p>
                </div>
                <CategoryChart transactions={transactions} />
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-3 sm:p-4`}>
                <div className="mb-3 sm:mb-4">
                  <h2 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Recent Transactions
                  </h2>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    View and manage your transactions
                  </p>
                </div>
                
                {/* Mobile-Optimized Controls */}
                <div className="flex flex-col gap-3 mb-4">
                  <Select value={sortBy} onValueChange={(value: 'date' | 'category' | 'amount') => setSortBy(value)}>
                    <SelectTrigger className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
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
                    className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : ''}`}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
                    {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                  </Button>
                </div>
                
                <TransactionList transactions={sortedTransactions} onDeleteTransaction={deleteTransaction} />
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-3 sm:p-4`}>
                <div className="mb-3 sm:mb-4">
                  <h2 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    Financial Overview
                  </h2>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Track your income, expenses, and balance
                  </p>
                </div>
                
                {/* Balance Summary - Mobile Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 sm:mb-6">
                  <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <div className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-green-700'}`}>Income</div>
                    <div className="text-sm sm:text-base lg:text-lg font-bold text-green-600">${totalIncome.toFixed(2)}</div>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
                    <div className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-red-700'}`}>Expenses</div>
                    <div className="text-sm sm:text-base lg:text-lg font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <div className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>Balance</div>
                    <div className={`text-sm sm:text-base lg:text-lg font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${(totalIncome - totalExpenses).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <ExpenseChart transactions={transactions} />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Transaction Form Modal - Mobile Optimized */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-3 sm:p-4 z-50">
          <div className={`rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
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