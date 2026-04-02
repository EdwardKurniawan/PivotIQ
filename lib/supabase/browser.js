'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseUrl, isSupabaseConfigured } from './config';

let client;

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createBrowserClient(
      getSupabaseUrl(),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}
