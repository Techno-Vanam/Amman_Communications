'use client';

import React from 'react';
import styles from './ReportTable.module.css';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface ReportTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalRecords?: number;
}

export function ReportTable<T extends { id?: string | number }>({
  columns,
  data,
  loading,
  emptyMessage = 'No records found for the selected filters.',
  page = 1,
  totalPages = 1,
  onPageChange,
  totalRecords,
}: ReportTableProps<T>) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    width: col.width,
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`}>
                  {columns.map((_, cIdx) => (
                    <td key={`cell-${rIdx}-${cIdx}`}>
                      <div className={styles.skeletonCell} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  <div className={styles.emptyContainer}>
                    <Inbox className={styles.emptyIcon} size={32} />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr key={row.id ? String(row.id) : `row-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td
                      key={`col-${cIdx}`}
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render
                        ? col.render(row)
                        : col.accessor
                        ? String(row[col.accessor] ?? '—')
                        : '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {onPageChange && (
        <div className={styles.paginationFooter}>
          <div className={styles.paginationInfo}>
            {totalRecords !== undefined ? (
              <span>Total: <strong>{totalRecords.toLocaleString('en-IN')}</strong> records</span>
            ) : (
              <span>Page {page} of {totalPages}</span>
            )}
          </div>
          <div className={styles.paginationControls}>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || loading}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>
            <span className={styles.pageIndicator}>
              {page} / {totalPages || 1}
            </span>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
              title="Next Page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
