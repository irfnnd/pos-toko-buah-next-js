"use client";

import { Button } from "@/components/tailgrids/core/button";
import { ArrowLeft, ArrowRight } from "@tailgrids/icons";

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize = 10,
  itemLabel = "data",
  onPageChange,
  isLoading = false,
}: TablePaginationProps) {
  if (totalCount === 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const endItem = Math.min(currentPage * pageSize, totalCount);
  const effectiveTotalPages = Math.max(1, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-card-border px-5 py-3.5 text-xs text-text-tertiary gap-3 bg-card-surface-area">
      <div>
        Menampilkan{" "}
        <span className="font-semibold text-text-primary">
          {startItem} - {endItem}
        </span>{" "}
        dari{" "}
        <span className="font-semibold text-text-primary">{totalCount}</span>{" "}
        {itemLabel}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          appearance="outline"
          isDisabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="text-xs px-2.5 py-1 gap-1"
          aria-label="Halaman sebelumnya"
        >
          <ArrowLeft className="size-3.5" />
          Sebelumnya
        </Button>

        <span className="px-2 font-medium text-text-primary">
          Halaman {currentPage} / {effectiveTotalPages}
        </span>

        <Button
          size="sm"
          appearance="outline"
          isDisabled={currentPage >= effectiveTotalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="text-xs px-2.5 py-1 gap-1"
          aria-label="Halaman selanjutnya"
        >
          Selanjutnya
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

