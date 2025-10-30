"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { inventoryItems, categories } from "@/lib/data"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/inventory/columns"
import { ItemModal } from "@/components/inventory/item-modal"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const allCategories = [{ id: 'all', name: 'All' }, ...categories];

  const filteredItems = React.useMemo(() => {
    return inventoryItems
      .filter(item => 
        selectedCategory === 'All' || item.category === selectedCategory
      )
      .filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [searchTerm, selectedCategory]);

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-semibold text-lg md:text-2xl">Inventory</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search items..." 
              className="pl-8 w-full sm:w-[240px] lg:w-[300px]" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map(category => (
                <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ItemModal>
            <Button className="whitespace-nowrap">Add Item</Button>
          </ItemModal>
        </div>
      </div>
      <DataTable 
        columns={columns} 
        data={filteredItems} 
      />
    </div>
  )
}
