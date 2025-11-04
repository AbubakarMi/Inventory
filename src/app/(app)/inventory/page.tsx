
'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/inventory/columns"
import { ItemModal } from "@/components/inventory/item-modal"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { useSearchParams } from "next/navigation"
import type { InventoryItem, Category } from "@/lib/types"

export default function InventoryPage() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  
  const itemsQuery = React.useMemo(() => firestore ? collection(firestore, 'inventory') : null, [firestore]);
  const { data: inventoryItems, loading: itemsLoading } = useCollection<InventoryItem>(itemsQuery);
  
  const categoriesQuery = React.useMemo(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const { data: categories, loading: categoriesLoading } = useCollection<Category>(categoriesQuery);

  const allCategories = React.useMemo(() => {
    return [{ id: 'all', name: 'All', parent: null }, ...(categories || [])];
  }, [categories]);

  const filteredItems = React.useMemo(() => {
    if (!inventoryItems) return [];
    return inventoryItems
      .filter(item => 
        selectedCategory === 'All' || item.category === selectedCategory
      )
      .filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).filter(item => {
        if (!statusFilter) return true;
        if (statusFilter === 'low') {
            return item.quantity <= item.threshold;
        }
        return true;
      });
  }, [searchTerm, selectedCategory, inventoryItems, statusFilter]);

  const isLoading = itemsLoading || categoriesLoading;
  
  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-semibold text-lg md:text-2xl">Inventory</h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:flex-initial">
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
          <ItemModal categories={categories || []}>
            <Button className="whitespace-nowrap w-full sm:w-auto">Add Item</Button>
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
