"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { LoadingSkeleton } from "./LoadingSkeleton";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = "Belum Ada Data",
  emptyDescription = "Data operasional untuk kriteria ini belum tersedia.",
  emptyAction,
  pagination,
  className,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
        <div className="h-6 w-48 bg-[#E5EAE6] rounded animate-pulse mb-4" />
        <LoadingSkeleton variant="table-row" />
        <LoadingSkeleton variant="table-row" />
        <LoadingSkeleton variant="table-row" />
        <LoadingSkeleton variant="table-row" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div
      className={cn(
        "bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-[#F8F9F8] text-text-secondary text-xs font-semibold uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3.5 whitespace-nowrap",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-text-primary">
            {data.map((item, idx) => {
              const isClickable = Boolean(onRowClick);

              return (
                <tr
                  key={keyExtractor(item, idx)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "transition-colors",
                    isClickable
                      ? "cursor-pointer hover:bg-[#F6F8F6] active:bg-[#EFF3F0]"
                      : "hover:bg-[#FAFBF9]"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3.5 whitespace-nowrap align-middle",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(item, idx)
                        : (item as Record<string, unknown>)[col.key] != null
                        ? String((item as Record<string, unknown>)[col.key])
                        : "-"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-border bg-[#FAFBF9] gap-3 text-xs text-text-secondary">
          <div>
            Total <span className="font-semibold text-text-primary">{pagination.totalItems}</span> data
            {pagination.totalPages > 1 && (
              <> &bull; Halaman {pagination.currentPage} dari {pagination.totalPages}</>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Sebelumnya
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
