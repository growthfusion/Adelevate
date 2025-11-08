import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://mhxrmrvruifwcdxrlvpy.supabase.co';
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oeHJtcnZydWlmd2NkeHJsdnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NTUxMjEsImV4cCI6MjA3MjAzMTEyMX0.HwIcEWHgTRh7lAvp9q881K_6_H0-vVAT-TprbXlUtNo';


export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',               // k
    },
});
