"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "./ui/button"

interface DataTableProps<TData, TValue> {
  columns: {
    accessorKey: string
    header: string
    cell: (props: { row: { original: TData } }) => React.ReactNode
  }[]
  data: TData[],
  emptyState?: React.ReactNode,
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyState
}: DataTableProps<TData, TValue>) {
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 10;
  const pageCount = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <div className="w-full">
        <div className="rounded-md border overflow-auto">
        <Table>
            <TableHeader>
            <TableRow>
                {columns.map((column) => (
                <TableHead key={column.accessorKey}>{column.header}</TableHead>
                ))}
            </TableRow>
            </TableHeader>
            <TableBody>
            {paginatedData.length ? (
                paginatedData.map((row, index) => (
                <TableRow key={(row as any).id || index}>
                    {columns.map((column) => (
                    <TableCell key={column.accessorKey}>
                        {column.cell({ row: { original: row } })}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    {emptyState || "No results."}
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
       {pageCount > 1 && (
         <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
            >
                Previous
            </Button>
            <span className="text-sm">
                Page {page + 1} of {pageCount}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                disabled={page >= pageCount - 1}
            >
                Next
            </Button>
        </div>
       )}
    </div>
  )
}
