export function getSupabaseUrl() {
  const raw = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    if (parsed.hostname === 'supabase.com') {
      const match = parsed.pathname.match(/\/dashboard\/project\/([a-z0-9]+)/i);
      if (match?.[1]) {
        return `https://${match[1]}.supabase.co`;
      }
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    const refMatch = raw.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
    if (refMatch?.[1]) {
      return `https://${refMatch[1]}.supabase.co`;
    }
    return raw.replace(/\/$/, '');
  }
}

export function isSupabaseConfigured() {
  return Boolean(
    getSupabaseUrl() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseServerConfigured() {
  return Boolean(
    getSupabaseUrl() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
