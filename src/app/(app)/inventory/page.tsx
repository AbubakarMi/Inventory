
"use client"

import * as React from "react"
import { useMemo } from "react";
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { getColumns } from "@/components/inventory/columns"
import { ItemModal } from "@/components/inventory/item-modal"
import { Input } from "@/components/ui/input"
import { Search, PackageSearch } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { initializeFirebase, useCollection } from "@/firebase"
import { collection, query } from "firebase/firestore"
import type { InventoryItem, Category } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryPage() {
  const { firestore } = initializeFirebase();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  
  const inventoryQuery = useMemo(() => firestore ? query(collection(firestore, 'inventory')) : null, [firestore]);
  const categoriesQuery = useMemo(() => firestore ? query(collection(firestore, 'categories')) : null, [firestore]);
  
  const { data: inventoryItems, loading: loadingItems } = useCollection<InventoryItem>(inventoryQuery);
  const { data: categories, loading: loadingCategories } = useCollection<Category>(categoriesQuery);

  const allCategories = useMemo(() => categories ? [{ id: 'all', name: 'All' }, ...categories] : [{id: 'all', name: 'All' }], [categories]);

  const filteredItems = React.useMemo(() => {
    if (!inventoryItems) return [];
    return inventoryItems
      .filter(item => 
        selectedCategory === 'All' || item.category === selectedCategory
      )
      .filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [inventoryItems, searchTerm, selectedCategory]);

  const columns = useMemo(() => getColumns({ categories: categories || [] }), [categories]);

  if (loadingItems || loadingCategories) {
    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="font-semibold text-lg md:text-2xl">Inventory</h1>
                <Skeleton className="h-10 w-full sm:w-[550px]" />
            </div>
            <div className="rounded-md border overflow-auto">
                <div className="w-full">
                    <div className="p-4"><Skeleton className="h-8 w-full" /></div>
                    <div className="p-4"><Skeleton className="h-8 w-full" /></div>
                    <div className="p-4"><Skeleton className="h-8 w-full" /></div>
                </div>
            </div>
        </div>
    )
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
                <SelectItem key={category.id!} value={category.name}>{category.name}</SelectItem>
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
        emptyState={
            <div className="flex flex-col items-center gap-4 text-center py-12">
                <PackageSearch className="h-16 w-16 text-muted-foreground" />
                <h3 className="text-xl font-bold tracking-tight">No inventory items found</h3>
                <p className="text-sm text-muted-foreground">Get started by adding your first item.</p>
                <ItemModal categories={categories || []}>
                    <Button>Add Item</Button>
                </ItemModal>
            </div>
        }
      />
    </div>
  )
}
