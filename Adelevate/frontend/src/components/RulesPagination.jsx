import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

const RulesDashboard = () => {
  // Example data (replace with your actual rules data or API response)
  const rules = Array.from({ length: 42 }, (_, i) => ({
    id: i + 1,
    name: `Rule ${i + 1}`,
    status: i % 2 === 0 ? "Active" : "Paused",
  }));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Calculate current rows to display
  const currentRules = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return rules.slice(startIndex, endIndex);
  }, [rules, currentPage, rowsPerPage]);

  const totalRules = rules.length;
  const totalPages = Math.ceil(totalRules / rowsPerPage) || 1;

  // Handle row change
  const handleRowsChange = (value) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  // Handle next and previous page
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-3">Rules Dashboard</h2>

      {/* ===== Rules Table ===== */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Rule Name</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {currentRules.length > 0 ? (
            currentRules.map((rule) => (
              <tr key={rule.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{rule.id}</td>
                <td className="p-2">{rule.name}</td>
                <td className="p-2">{rule.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-2 text-gray-500 text-center" colSpan="3">
                No rules found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ===== Pagination Footer ===== */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 mt-4">
        <div className="text-sm text-gray-600">
          Total: <span className="font-medium">{totalRules}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Rows per page */}
          <span className="text-sm text-gray-600">Rows per page:</span>

          <div className="relative group">
            <button className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm">
              {rowsPerPage} <ChevronDown className="w-3 h-3" />
            </button>

            <div className="absolute right-0 top-full mt-1 bg-white border shadow-lg rounded-md hidden group-hover:block z-10 p-2 w-20">
              {[5, 10, 20, 30, 50, 100].map((num) => (
                <button
                  key={num}
                  onClick={() => handleRowsChange(num)}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-2 py-1 border rounded-md text-sm ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              ‹
            </button>

            <span className="px-2 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 border rounded-md text-sm ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesDashboard;
