"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface Transaction {
  id: number
  category: string
  description: string
  amount: number
  date: string
}

interface CategoryChartProps {
  transactions: Transaction[]
}

// Dynamic color generation based on category name hash
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

export function CategoryChart({ transactions }: CategoryChartProps) {
  // Filter out income transactions (positive amounts) - only show expenses
  const expenseTransactions = transactions.filter(t => t.amount < 0)
  
  const categoryData = expenseTransactions.reduce((acc, transaction) => {
    const category = transaction.category
    if (acc[category]) {
      acc[category] += Math.abs(transaction.amount)
    } else {
      acc[category] = Math.abs(transaction.amount)
    }
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value: value
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={generateCategoryColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
} 