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

    if (!logs.length) return <p className="p-6 text-gray-500">No logs found.</p>;

    return (
        <div className="p-6 bg-white min-h-screen">
            <h1 className="text-2xl font-semibold mb-4">Action Logs</h1>
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
