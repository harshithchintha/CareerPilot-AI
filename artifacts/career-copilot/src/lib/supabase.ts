import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vdubgwfkbxxpsaybmnhw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ppIs-B6S5ZcpKiDUGbJzqQ_ZSonT6hW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
