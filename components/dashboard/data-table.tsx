"use client";

import * as React from "react";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLoader,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { toast } from "sonner";

export const schema = z.object({
  building_id: z.number(),
  category: z.string(),
  created_at: z.string(),
  id: z.number(),
  images: z.string(),
  reporter: z.string(),
  status: z.string(),
  title: z.string(),
  description: z.string(),
  buildings: z.object({
    id: z.number(),
    name: z.string(),
    address: z.string(),
    city: z.string(),
    user_id: z.string(),
    contact_name: z.string(),
    contact_email: z.string(),
    contacts: z.array(
      z.object({
        label: z.string(),
        phone: z.string(),
      })
    ),
  }),
});

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("pl-PL", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({
  data,
  updateAlertStatus,
}: {
  data: z.infer<typeof schema>[];
  updateAlertStatus: (id: number, status: string) => Promise<void>;
}) {
  const statusOrder = ["Nowy", "W trakcie", "Zakończony"];
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "status", desc: false },
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 12,
  });

  const supabase = createClient();

  const handleRemoveAlert = async (id: number) => {
    const { error } = await supabase.from("alerts").delete().eq("id", id);

    if (error) {
      toast.error("Nie udało się usunąć zgłoszenia");
      return;
    }

    toast.success("Zgłoszenie usunięte");

    // usuń lokalnie z listy
  };

  const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Tytuł zgłoszenia",
      cell: ({ row }) => {
        return (
          <TableCellViewer
            item={row.original}
            updateAlertStatus={updateAlertStatus}
          />
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "building",
      header: "Nieruchomość",
      cell: ({ row }) => {
        const building = row.original.buildings;
        return (
          <div className="flex flex-col gap-1">
            <p>{building?.address}</p>
            <Badge variant="outline" className="text-muted-foreground px-1.5">
              {building?.name}
            </Badge>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "created_at",
      header: "Data zgłoszenia",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        const formattedDate = dateFormatter.format(date); // e.g., "27 października 2025"
        const formattedTime = timeFormatter.format(date);
        return (
          <div>
            <Badge variant="outline" className="text-muted-foreground px-1.5">
              {formattedDate} / {formattedTime}
            </Badge>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "category",
      header: "Kategoria",
      cell: ({ row }) => (
        <div>
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.category}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        let icon;

        switch (row.original.status) {
          case "Nowy":
            icon = (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
            );
            break;
          case "W trakcie":
            icon = <IconLoader />;
            break;
          case "Nie rozpoczęto":
            icon = <IconAlertTriangle />;
            break;
          default:
            break;
        }
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {icon}
            {row.original.status}
          </Badge>
        );
      },
      sortingFn: (rowA, rowB) => {
        const order = ["Nowy", "W trakcie", "Zakończony"];
        return (
          order.indexOf(rowA.original.status) -
          order.indexOf(rowB.original.status)
        );
      },
    },

    {
      id: "actions",
      cell: ({ row }) => {
        if (row.original.status === "Zakończony") {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                  size="icon"
                >
                  <IconDotsVertical />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}
                {/* <DropdownMenuItem>Make a copy</DropdownMenuItem> */}
                {/* <DropdownMenuItem>Favorite</DropdownMenuItem> */}
                {/* <DropdownMenuSeparator /> */}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleRemoveAlert(row.original.id)}
                >
                  Usuń
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      },
    },
  ];

  const sortedData = React.useMemo(() => {
    return [...data].sort(
      (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    );
  }, [data]);

  const table = useReactTable({
    data: sortedData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {table.getRowModel().rows.length > 0 ? (
              <SortableContext
                items={table.getRowModel().rows.map((row) => row.id)}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </SortableContext>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Brak zgłoszeń.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4 mt-5">
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Wyników na strone
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[12, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Strona {table.getState().pagination.pageIndex + 1} z{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function TableCellViewer({
  item,
  updateAlertStatus,
}: {
  item: z.infer<typeof schema>;
  updateAlertStatus: (id: number, status: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(item.status || "Nowy");
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const date = new Date(item.created_at);
  const formattedDate = dateFormatter.format(date); // e.g., "27 października 2025"
  const formattedTime = timeFormatter.format(date);

  const handleStatusChange = async (value: string) => {
    setLoading(true);
    try {
      await updateAlertStatus(item.id, value);
      setStatus(value); // zmiana po udanym zapisie
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left cursor-pointer"
        >
          {item.title}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.title}</DrawerTitle>
          <DrawerDescription className="flex flex-col items-center md:items-start gap-2">
            <Badge variant="outline" className="text-muted-foreground px-1.5">
              {formattedDate} / {formattedTime}
            </Badge>
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form className="flex flex-col gap-4 md:gap-8">
            <div className="grid grid-cols-1 gap-4 md:gap-8">
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select
                  defaultValue={status}
                  onValueChange={handleStatusChange}
                  disabled={loading}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Wybierz status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zakończony">Zakończony</SelectItem>
                    <SelectItem value="W trakcie">W trakcie</SelectItem>
                    <SelectItem value="Nowy">Nowy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Opis</Label>
                <p>{item.description ? item.description : "Brak opisu"}</p>
              </div>

              {item.images && (
                <div className="flex flex-col gap-3">
                  <Label htmlFor="images">Zdjęcia</Label>

                  <div className="relative h-70">
                    <Image
                      fill
                      className="h-70 object-contain"
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL}/${item.images}`}
                      alt={item.title}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Label htmlFor="contacts">Kontakty</Label>
                <div className="space-y-5">
                  {item.buildings?.contacts?.length > 0 ? (
                    item.buildings.contacts.map((contact) => (
                      <div key={contact.label.replace(" ", "-")}>
                        <p className="font-medium mb-1">{contact.label}</p>
                        <Button asChild variant="outline">
                          <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div>
                      <p>Brak zapisanych kontaktów</p>
                      <p className="text-sm">
                        Przejdź do Nieruchomości aby dodać kontakt
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Zapisz</Button>
          <DrawerClose asChild>
            <Button variant="outline">Zamknij</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
