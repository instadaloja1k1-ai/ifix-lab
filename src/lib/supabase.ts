import { createClient } from '@supabase/supabase-js';

// As chaves "publishable/anon" do Supabase são públicas por natureza (vão no
// navegador de qualquer forma). A segurança vem das políticas RLS do banco.
export const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL || 'https://svdsvmylwzfofxydwbmp.supabase.co';
export const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_x7kcURZCS-Be8Uj-E5S8vQ_jX9XyMd4';
export const isSupabaseConfigured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

if (!isSupabaseConfigured) {
  console.warn(
    '[iFix Lab] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configurados. Copie .env.example para .env e preencha com os dados do seu projeto Supabase.',
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { flowType: 'pkce' },
});
