"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Calendar, Tag } from "lucide-react"

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

// Dynamic color generation based on category name hash (same as pie chart)
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

const getCategoryColor = (category: string) => {
  const color = generateCategoryColor(category)
  
  // Convert HSL to RGB for better Tailwind compatibility
  const hsl = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!hsl) return "bg-gray-100 text-gray-800"
  
  const h = parseInt(hsl[1])
  const s = parseInt(hsl[2])
  const l = parseInt(hsl[3])
  
  // Simple HSL to RGB conversion for background colors
  const hue = h / 360
  const sat = s / 100
  const light = l / 100
  
  const c = (1 - Math.abs(2 * light - 1)) * sat
  const x = c * (1 - Math.abs((hue * 6) % 2 - 1))
  const m = light - c / 2
  
  let r, g, b
  if (hue < 1/6) {
    [r, g, b] = [c, x, 0]
  } else if (hue < 2/6) {
    [r, g, b] = [x, c, 0]
  } else if (hue < 3/6) {
    [r, g, b] = [0, c, x]
  } else if (hue < 4/6) {
    [r, g, b] = [0, x, c]
  } else if (hue < 5/6) {
    [r, g, b] = [x, 0, c]
  } else {
    [r, g, b] = [c, 0, x]
  }
  
  const r255 = Math.round((r + m) * 255)
  const g255 = Math.round((g + m) * 255)
  const b255 = Math.round((b + m) * 255)
  
  // Generate lighter background and darker text
  const bgColor = `rgb(${Math.round(r255 * 0.9)}, ${Math.round(g255 * 0.9)}, ${Math.round(b255 * 0.9)})`
  const textColor = `rgb(${Math.round(r255 * 0.3)}, ${Math.round(g255 * 0.3)}, ${Math.round(b255 * 0.3)})`
  
  return `bg-[${bgColor}] text-[${textColor}]`
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
      <div className="text-center py-8 sm:py-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
        </div>
        <div className="text-base sm:text-lg font-medium mb-2 text-gray-900">No transactions found</div>
        <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          {transactions.length === 0 ? "Add your first transaction to get started!" : "Try adjusting your search or filters."}
        </div>
        <Button variant="outline" size="sm">
          Add Transaction
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="hover:shadow-md transition-all duration-200 border-l-4" style={{
          borderLeftColor: generateCategoryColor(transaction.category)
        }}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <Badge 
                    className="text-xs px-2 py-1 font-medium"
                    style={{
                      backgroundColor: generateCategoryColor(transaction.category),
                      color: '#ffffff'
                    }}
                  >
                    {transaction.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(transaction.date)}
                  </div>
                </div>
                
                {transaction.description && (
                  <p className="font-medium text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">
                    {transaction.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4">
                <div className="text-right">
                  <span className={`font-bold text-sm sm:text-lg ${
                    transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatAmount(transaction.amount)}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    {transaction.amount < 0 ? 'Expense' : 'Income'}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteTransaction(transaction.id)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
