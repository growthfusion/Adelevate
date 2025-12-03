import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const Table = ({
  columns,
  data,
  onSort,
  sortBy,
  sortOrder,
  onRowClick,
  emptyMessage = "No data available",
  className = ""
}) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`
                  text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider
                  ${column.sortable ? "cursor-pointer hover:bg-gray-100" : ""}
                `}
                onClick={() => column.sortable && onSort && onSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && sortBy === column.key && (
                    <span>
                      {sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  ${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                  transition-colors
                `}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="py-4 px-6 text-sm text-gray-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
