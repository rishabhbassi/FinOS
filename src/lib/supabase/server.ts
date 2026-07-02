// Finance OS - Supabase Server Client
// For server-side usage with TanStack Start

import { createServerClient } from '@supabase/ssr';
import { getHeaders } from '@tanstack/react-start/server';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export function getSupabaseServer() {
  const headers = getHeaders();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookie = headers.get('cookie') ?? '';
        return cookie.split('; ').filter(Boolean).map(c => {
          const [name, ...rest] = c.split('=');
          return { name, value: rest.join('=') };
        });
      },
      setAll() {
        // Server-side: cookies are set via response headers
      },
    },
  });
}
