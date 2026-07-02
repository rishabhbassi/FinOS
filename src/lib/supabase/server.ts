// FinOS - Supabase Server Client
// For server-side usage with TanStack Start
// Pass request headers from route loaders / server functions

import { createServerClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export function getSupabaseServer(requestHeaders?: Headers) {
  const cookie = requestHeaders?.get('cookie') ?? '';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
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
