"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useEffect, useState } from "react"

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

const generateCategoryColor = (category: string) => {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    const char = category.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const hue = Math.abs(hash) % 360
  const saturation = 70 + (Math.abs(hash) % 20)
  const lightness = 45 + (Math.abs(hash) % 15)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export function CategoryChart({ transactions }: CategoryChartProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const data = Object.entries(categoryData).map(([name, value]) => ({ name, value }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No expenses yet</div>
          <div className="text-sm">Add some expenses to see your spending breakdown</div>
        </div>
      </div>
    )
  }

  // Custom label: mobile shows only percentages for ALL segments, desktop shows name + percent for ALL segments
  const renderLabel = ({ name, percent }: { name: string, percent: number }) => {
    if (isMobile) {
      // Show percentage for ALL segments on mobile
      return `${(percent * 100).toFixed(0)}%`
    } else {
      // Desktop: show name + percent for ALL segments
      return `${name} ${(percent * 100).toFixed(0)}%`
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy={isMobile ? "38%" : "40%"}
          labelLine={false}
          label={renderLabel}
          outerRadius={isMobile ? "50%" : "55%"}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={generateCategoryColor(entry.name)} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
          labelFormatter={(label) => `Category: ${label}`}
        />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{ fontSize: isMobile ? '10px' : '12px', paddingTop: isMobile ? '15px' : '10px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
} 