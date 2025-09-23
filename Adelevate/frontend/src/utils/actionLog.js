import { supabase } from '@/supabaseClient';

export async function logAction({ userEmail, action, details = {} }) {
    if (!userEmail) {
        console.error('Cannot log action: userEmail missing');
        return;
    }

    const { error } = await supabase
        .from('Adelevate_Action_Log')
        .insert([{ email: userEmail, action, details }]);

    if (error) console.error('Failed to log action:', error.message);
}
