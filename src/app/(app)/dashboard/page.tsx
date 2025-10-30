import { AlertCircle, PlusCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import StatCard from "@/components/dashboard/stat-card"
import { inventoryItems, topSellingItems } from "@/lib/data"
import { TopProductsTable } from "@/components/dashboard/top-products-table"
import { DashboardCharts } from "@/components/dashboard/charts"

export default function DashboardPage() {
  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockItems = inventoryItems.filter(item => item.status === 'Low Stock').length
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + item.cost * item.quantity, 0)
  const totalSales = 2856.50 // static value

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Item
          </Button>
      </div>

      <Alert variant="warning" className="flex items-center">
        <AlertCircle className="h-4 w-4" />
        <div className="ml-3">
          <AlertTitle className="font-semibold">Low Stock Alert!</AlertTitle>
          <AlertDescription>
            You have {lowStockItems} items running low on stock.
          </AlertDescription>
        </div>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard title="Total Items in Stock" value={totalItems.toLocaleString()} />
        <StatCard title="Low Stock Items" value={lowStockItems} />
        <StatCard title="Total Sales" value={`$${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard title="Total Inventory Value" value={`$${inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DashboardCharts />
        </div>
        <div>
          <TopProductsTable items={topSellingItems} />
        </div>
      </div>
    </div>
  )
}
