import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mhxrmrvruifwcdxrlvpy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oeHJtcnZydWlmd2NkeHJsdnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NTUxMjEsImV4cCI6MjA3MjAzMTEyMX0.HwIcEWHgTRh7lAvp9q881K_6_H0-vVAT-TprbXlUtNo';  // Replace with your Supabase key
export const supabase = createClient(supabaseUrl, supabaseKey);
