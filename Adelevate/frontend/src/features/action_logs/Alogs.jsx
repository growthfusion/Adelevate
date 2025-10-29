import React, { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';

export default function LogsDashboard() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from('Adelevate_Action_Log')
                .select('email, action, details, created_at')
                .order('created_at', { ascending: false });

            if (error) console.error(error);
            else setLogs(data);
        };

        fetchLogs();

        const channel = supabase
            .channel('action-log')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'Adelevate_Action_Log' },
                (payload) => setLogs(prev => [payload.new, ...prev])
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const exportLogs = () => {
        // Filter logs for the last 24 hours
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        
        const recentLogs = logs.filter(log => 
            new Date(log.created_at) >= twentyFourHoursAgo
        );
        
        // Create CSV headers
        const headers = ['Email', 'Action', 'Details', 'Time'];
        
        // Convert data to CSV format
        const csvData = recentLogs.map(log => [
            log.email,
            log.action,
            log.details,
            new Date(log.created_at).toLocaleString()
        ]);
        
        // Add headers to the beginning
        csvData.unshift(headers);
        
        // Convert to CSV string
        const csvContent = csvData.map(row => 
            row.map(cell => 
                typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
            ).join(',')
        ).join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Set file name with current date
        const fileName = `action_logs_${now.toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!logs.length) return <p className="p-6 text-gray-500">No logs found.</p>;

    return (
        <div className="p-6 bg-white min-h-screen">
            <h1 className="text-2xl font-semibold mb-4">Action Logs</h1>
            <button 
                onClick={exportLogs}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                Export Last 24 Hours
            </button>
            <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Action</th>
                    <th className="p-2 text-left">Details</th>
                    <th className="p-2 text-left">Time</th>
                </tr>
                </thead>
                <tbody>
                {logs.map((log, i) => (
                    <tr key={i} className="hover:bg-gray-100 border-b">
                        <td className="p-2">{log.email}</td>
                        <td className="p-2">{log.action}</td>
                        <td className="p-2">{log.details}</td>
                        <td className="p-2">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
