// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xxxxxxxx.supabase.co' // remplace par ton URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI...' // remplace par ta clé "anon public"

export const supabase = createClient(supabaseUrl, supabaseKey)
