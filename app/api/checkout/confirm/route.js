import Stripe from 'stripe';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    })
  : null;

const UNLOCKABLE_TIERS = new Set(['peek', 'full']);

function getTesterBypassEmails() {
  return String(process.env.ADMIN_BYPASS_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

async function authorizeReport(supabase, reportId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, report: null };
  }

  const { data: report, error } = await supabase
    .from('reports')
    .select('id, user_id, access_tier')
    .eq('id', reportId)
    .eq('user_id', user.id)
    .single();

  if (error || !report) {
    return { user, report: null };
  }

  return { user, report };
}

export async function POST(request) {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return Response.json({ success: false, error: 'Supabase is not configured.' }, { status: 400 });
    }

    const { reportId, tier, sessionId, demoMode } = await request.json();

    if (!reportId || !UNLOCKABLE_TIERS.has(tier)) {
      return Response.json({ success: false, error: 'Missing or invalid unlock details.' }, { status: 400 });
    }

    const { user, report } = await authorizeReport(supabase, reportId);
    if (!user || !report) {
      return Response.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    if (demoMode) {
      const testerBypassEmails = getTesterBypassEmails();
      const isAllowedBypassUser = testerBypassEmails.includes(String(user.email || '').toLowerCase());

      if (stripe && !isAllowedBypassUser) {
        return Response.json({ success: false, error: 'Demo unlock is not allowed for this account.' }, { status: 403 });
      }
    } else {
      if (!stripe) {
        return Response.json({ success: false, error: 'Stripe is not configured.' }, { status: 400 });
      }

      if (!sessionId) {
        return Response.json({ success: false, error: 'Missing checkout session.' }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return Response.json({ success: false, error: 'Payment is not confirmed.' }, { status: 400 });
      }

      if (session.metadata?.reportId !== reportId || session.metadata?.tier !== tier || session.metadata?.userId !== user.id) {
        return Response.json({ success: false, error: 'Checkout session does not match this report.' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('reports')
      .update({ access_tier: tier })
      .eq('id', reportId)
      .eq('user_id', user.id)
      .select('id, access_tier')
      .single();

    if (error || !data) {
      return Response.json({ success: false, error: error?.message || 'Failed to unlock report.' }, { status: 500 });
    }

    return Response.json({ success: true, reportId: data.id, tier: data.access_tier });
  } catch (error) {
    console.error('Checkout confirm error:', error);
    return Response.json({ success: false, error: 'Failed to confirm checkout.' }, { status: 500 });
  }
}
