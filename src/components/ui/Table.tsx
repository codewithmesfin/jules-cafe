import React from 'react';
import { cn } from '../../utils/cn';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  mobileHidden?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export function Table<T>({ data, columns, className, onRowClick, emptyMessage = 'No data available', loading }: TableProps<T>) {
  const visibleColumns = columns.filter(col => !col.mobileHidden);

  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-slate-200 bg-white', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {visibleColumns.map((column, index) => (
              <th key={index} className={cn('px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider', column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={visibleColumns.length} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                  <p className="text-slate-500 text-sm">Loading...</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={visibleColumns.length} className="px-4 py-12 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(item)}
                className={cn('bg-white transition-colors', onRowClick && 'cursor-pointer hover:bg-slate-50')}
              >
                {visibleColumns.map((column, colIndex) => (
                  <td key={colIndex} className={cn('px-4 py-3 text-slate-700', column.className)}>
                    {typeof column.accessor === 'function'
                      ? column.accessor(item)
                      : (item[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Mobile-friendly card list view for tables
interface MobileTableCardProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  renderCard?: (item: T) => React.ReactNode;
}

export function MobileTableCard<T>({ 
  data, 
  columns, 
  onRowClick, 
  emptyMessage = 'No data available', 
  loading,
  renderCard 
}: MobileTableCardProps<T>) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 text-slate-300 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:hidden">
      {data.map((item, index) => (
        <div
          key={index}
          onClick={() => onRowClick?.(item)}
          className={cn(
            'bg-white rounded-xl border border-slate-200 p-4 transition-all',
            onRowClick && 'cursor-pointer hover:border-slate-300 hover:shadow-sm'
          )}
        >
          {renderCard ? renderCard(item) : (
            <div className="space-y-3">
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="flex justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{column.header}</span>
                  <span className="text-sm text-slate-900">
                    {typeof column.accessor === 'function'
                      ? column.accessor(item)
                      : (item[column.accessor] as React.ReactNode)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
