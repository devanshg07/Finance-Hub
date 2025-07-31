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
      <div className="text-center py-8 text-gray-500">
        <div className="text-lg font-medium mb-2">No transactions yet</div>
        <div className="text-sm">Add your first transaction to get started!</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Badge 
                className={`text-xs px-2 py-1`}
                style={{
                  backgroundColor: generateCategoryColor(transaction.category),
                  color: '#ffffff'
                }}
              >
                {transaction.category}
              </Badge>
              <span className="text-sm text-gray-500">
                {formatDate(transaction.date)}
              </span>
            </div>
            {transaction.description && (
              <p className="font-medium text-gray-900 text-sm truncate">
                {transaction.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <span className={`font-semibold text-sm ${
              transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {formatAmount(transaction.amount)}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteTransaction(transaction.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
