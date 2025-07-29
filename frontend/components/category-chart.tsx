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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function CategoryChart({ transactions }: CategoryChartProps) {
  const categoryData = transactions.reduce((acc, transaction) => {
    const category = transaction.category
    if (acc[category]) {
      acc[category] += transaction.amount
    } else {
      acc[category] = transaction.amount
    }
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value: Math.abs(value)
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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