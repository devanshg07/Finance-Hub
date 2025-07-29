"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Transaction {
  id: number
  category: string
  description: string
  amount: number
  date: string
}

interface ExpenseChartProps {
  transactions: Transaction[]
}

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date)
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!acc[monthYear]) {
      acc[monthYear] = 0
    }
    acc[monthYear] += Math.abs(transaction.amount)
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({
      month,
      total
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={(value) => {
                const [year, month] = value.split('-')
                return `${month}/${year.slice(2)}`
              }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
              labelFormatter={(label) => {
                const [year, month] = label.split('-')
                return `${month}/${year}`
              }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
