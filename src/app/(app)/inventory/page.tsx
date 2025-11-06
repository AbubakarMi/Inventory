"use client"

import * as React from "react"
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { getColumns } from "@/components/inventory/columns"
import { ItemModal } from "@/components/inventory/item-modal"
import { Input } from "@/components/ui/input"
import { Search, PackageSearch } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api-client"
import type { InventoryItem, Category } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { toast } = useToast();

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = React.useCallback(async () => {
    try {
      setLoadingItems(true);
      setLoadingCategories(true);
      const [inventoryRes, categoriesRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/categories'),
      ]);
      setInventoryItems(inventoryRes.items || []);
      setCategories(categoriesRes.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingItems(false);
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

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

  const columns = useMemo(() => getColumns({ categories: categories || [], toast, onRefresh: handleRefresh }), [categories, toast]);

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
          <ItemModal categories={categories || []} onSuccess={handleRefresh}>
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
                <ItemModal categories={categories || []} onSuccess={handleRefresh}>
                    <Button>Add Item</Button>
                </ItemModal>
            </div>
        }
      />
    </div>
  )
}
