import { useState } from "react";

export default function LogsDashboard({ onBack }) {

    const columns = [
        "Email",
        "Action",
        "Details",
        "Created_at",
    ];

    return (
        <div className="p-6 bg-white min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold text-blue-500">Action Logs</h1>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-10 gap-4 px-6 py-3">
                        {columns.map((column, index) => (
                            <div key={column} className={`text-sm font-medium text-gray-700 flex items-center gap-1 ${index < columns.length - 1 ? "border-r border-gray-200 pr-4" : ""}`}>
                                {column}
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table Body - No Results */}
                <div className="px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">No Results</p>
                </div>
            </div>
        </div>
    );
}
