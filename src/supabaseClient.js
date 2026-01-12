import { createClient } from '@supabase/supabase-js'

// Estas variáveis virão da configuração da Vercel, não do código
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
