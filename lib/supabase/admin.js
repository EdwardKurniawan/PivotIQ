import { createClient } from '@supabase/supabase-js';
import { isSupabaseServerConfigured } from './config';

let adminClient;

export function createSupabaseAdminClient() {
  if (!isSupabaseServerConfigured()) return null;

  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return adminClient;
}
