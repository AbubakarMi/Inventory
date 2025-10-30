import { Button } from "@/components/ui/button"
import { inventoryItems, categories } from "@/lib/data"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/inventory/columns"
import { ItemModal } from "@/components/inventory/item-modal"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InventoryPage() {
  const allCategories = [{ id: 'all', name: 'All' }, ...categories];

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Inventory</h1>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search items..." className="pl-8 sm:w-[300px]" />
            </div>
            <ItemModal>
              <Button>Add Item</Button>
            </ItemModal>
        </div>
      </div>
      <Tabs defaultValue="All">
        <TabsList>
          {allCategories.map(category => (
            <TabsTrigger key={category.id} value={category.name}>{category.name}</TabsTrigger>
          ))}
        </TabsList>
        {allCategories.map(category => (
          <TabsContent key={category.id} value={category.name}>
            <DataTable 
              columns={columns} 
              data={
                category.name === 'All' 
                  ? inventoryItems 
                  : inventoryItems.filter(item => item.category === category.name)
              } 
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
