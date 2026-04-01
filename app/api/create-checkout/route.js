import Stripe from 'stripe';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

const STRIPE_PRODUCT_ID = process.env.STRIPE_PRODUCT_ID || 'prod_UG2FLksJs2g5TH';

const TIERS = {
  peek: {
    name: 'PivotIQ Quick Peek',
    description: 'Task-level risk diagnosis, your strongest pivot direction, and a clearer read on where the pressure is building.',
    price: 299, // $2.99 in cents
  },
  full: {
    name: 'PivotIQ Full Pivot Plan',
    description: 'Best-fit pivot, 3 adjacent paths, skill-gap actions, and a 12-week roadmap you can actually follow.',
    price: 2999, // $29.99 in cents
  },
};

function getTesterBypassEmails() {
  return String(process.env.ADMIN_BYPASS_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(req) {
  try {
    const { tier, reportId, jobTitle, industry, email } = await req.json();

    if (!TIERS[tier]) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const t = TIERS[tier];
    const requestOrigin = req.headers.get('origin') || req.headers.get('referer') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const appUrl = new URL(requestOrigin).origin;
    let userId = '';
    let userEmail = '';

    if (reportId) {
      const supabase = createSupabaseServerClient();
      if (!supabase) {
        return Response.json({ error: 'Supabase is not configured.' }, { status: 400 });
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return Response.json({ error: 'You must be signed in to unlock a saved report.' }, { status: 401 });
      }

      const { data: report, error: reportError } = await supabase
        .from('reports')
        .select('id')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .single();

      if (reportError || !report) {
        return Response.json({ error: 'Saved report not found for this account.' }, { status: 404 });
      }

      userId = user.id;
      userEmail = String(user.email || '').toLowerCase();
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({
        url: `${appUrl}/success?tier=${tier}&demo=1${reportId ? `&report_id=${reportId}` : ''}`,
        demoMode: true,
      });
    }

    const testerBypassEmails = getTesterBypassEmails();
    if (reportId && userEmail && testerBypassEmails.includes(userEmail)) {
      return Response.json({
        url: `${appUrl}/success?tier=${tier}&demo=1${reportId ? `&report_id=${reportId}` : ''}`,
        demoMode: true,
        testerBypass: true,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product: STRIPE_PRODUCT_ID,
          unit_amount: t.price,
        },
        quantity: 1,
      }],
      customer_email: email || undefined,
      success_url: `${appUrl}/success?tier=${tier}&session_id={CHECKOUT_SESSION_ID}${reportId ? `&report_id=${reportId}` : ''}`,
      cancel_url: reportId ? `${appUrl}/report/${reportId}` : `${appUrl}/report`,
      metadata: {
        tier,
        reportId: reportId || '',
        userId,
        jobTitle: jobTitle || '',
        industry: industry || '',
        email:    email    || '',
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
