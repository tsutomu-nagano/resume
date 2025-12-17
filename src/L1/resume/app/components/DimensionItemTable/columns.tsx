"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type DimensionItem = {
  id: string
  name: string
//   status: "pending" | "processing" | "success" | "failed"
//   email: string
}

export const columns: ColumnDef<DimensionItem>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          項目名
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]