"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"

interface Transaction {
  id: number
  category: string
  description: string
  amount: number
  date: string
}

interface TransactionListProps {
  transactions: Transaction[]
  onDeleteTransaction: (id: number) => void
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Food & Dining": "bg-orange-100 text-orange-800",
    "Transportation": "bg-blue-100 text-blue-800",
    "Shopping": "bg-purple-100 text-purple-800",
    "Entertainment": "bg-pink-100 text-pink-800",
    "Healthcare": "bg-red-100 text-red-800",
    "Utilities": "bg-yellow-100 text-yellow-800",
    "Housing": "bg-green-100 text-green-800",
    "Education": "bg-indigo-100 text-indigo-800",
    "Travel": "bg-teal-100 text-teal-800",
    "Other": "bg-gray-100 text-gray-800"
  }
  return colors[category] || "bg-gray-100 text-gray-800"
}

export function TransactionList({ transactions, onDeleteTransaction }: TransactionListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No transactions yet. Add your first transaction above!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={getCategoryColor(transaction.category)}>
                      {transaction.category}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">
                    {transaction.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${
                    transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatAmount(transaction.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
