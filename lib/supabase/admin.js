import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, isSupabaseServerConfigured } from './config';

let adminClient;

export function createSupabaseAdminClient() {
  if (!isSupabaseServerConfigured()) return null;

  if (!adminClient) {
    adminClient = createClient(
      getSupabaseUrl(),
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
