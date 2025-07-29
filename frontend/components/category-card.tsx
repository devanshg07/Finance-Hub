"use client"

import { cn } from "@/lib/utils"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface Category {
  id: string
  name: string
  color: string
}

interface CategoryCardProps {
  title: string
  categories: Category[]
  onAddCategory: (name: string, color: string) => void
  onRemoveCategory: (id: string) => void
  type: "income" | "expense"
}

const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"]

export function CategoryCard({ title, categories, onAddCategory, onRemoveCategory, type }: CategoryCardProps) {
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedColor, setSelectedColor] = useState(colors[0])
  const [isAdding, setIsAdding] = useState(false)

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), selectedColor)
      setNewCategoryName("")
      setSelectedColor(colors[0])
      setIsAdding(false)
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle
            className={cn(
              "text-lg font-semibold",
              type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
            )}
          >
            {title}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)} className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="space-y-3 rounded-lg border p-3 bg-accent/20">
            <Input
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              className="bg-background"
            />
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
                    selectedColor === color ? "border-foreground scale-110" : "border-muted",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddCategory}>
                Add Category
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">No categories yet</p>
              <p className="text-xs text-muted-foreground">Click the + button above to add your first category</p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-all hover:bg-accent/50 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full border border-white/20"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveCategory(category.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 