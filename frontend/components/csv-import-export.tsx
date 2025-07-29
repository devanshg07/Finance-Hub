"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Upload, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CSVImportExportProps {
  onImportSuccess: () => void
}

export function CSVImportExport({ onImportSuccess }: CSVImportExportProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importMessage, setImportMessage] = useState("")

  const handleImport = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('https://finance-hub-hc1s.onrender.com/api/tasks/import', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: `Imported ${data.count} transactions successfully!`,
        })
        // Refresh the transactions list
        window.location.reload()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to import transactions",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import transactions. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportMessage("")

    try {
      await handleImport(file)
      setImportMessage("Import successful!")
      onImportSuccess()
    } catch (error) {
      setImportMessage("Import failed")
    } finally {
      setIsImporting(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('https://finance-hub-hc1s.onrender.com/api/tasks/export')
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'transactions.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Success",
          description: "Transactions exported successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to export transactions",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export transactions. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Import / Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Import Section */}
        <div className="space-y-2">
          <Label htmlFor="csv-import">Import from CSV</Label>
          <div className="flex items-center gap-2">
            <Input
              id="csv-import"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isImporting}
            />
            <Button variant="outline" size="sm" disabled={isImporting}>
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? "Importing..." : "Import"}
            </Button>
          </div>
          {importMessage && (
            <p className={`text-sm ${importMessage.includes('Successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {importMessage}
            </p>
          )}
        </div>

        {/* Export Section */}
        <div className="space-y-2">
          <Label>Export to CSV</Label>
          <Button 
            variant="outline" 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export All Transactions"}
          </Button>
        </div>

        {/* CSV Format Info */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          <p className="font-medium mb-2">CSV Format:</p>
          <p>Your CSV should have these columns:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li><code>category</code> - "expense" or "income"</li>
            <li><code>description</code> - Transaction description</li>
            <li><code>amount</code> - Transaction amount</li>
            <li><code>date</code> - Date (YYYY-MM-DD format)</li>
            <li><code>user</code> - User identifier (optional)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 