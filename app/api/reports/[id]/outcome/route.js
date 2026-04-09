import { createSupabaseServerClient } from '../../../../../lib/supabase/server';
import { createSupabaseAdminClient } from '../../../../../lib/supabase/admin';

async function getAuthorizedReport(supabase, reportId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, report: null };

  const { data: report } = await supabase
    .from('reports')
    .select('id, user_id')
    .eq('id', reportId)
    .eq('user_id', user.id)
    .single();

  return { user, report };
}

export async function PATCH(request, { params }) {
  try {
    const supabase = createSupabaseServerClient();
    const admin = createSupabaseAdminClient();
    if (!supabase || !admin) {
      return Response.json({ success: false, error: 'Supabase is not configured.' }, { status: 400 });
    }

    const { user, report } = await getAuthorizedReport(supabase, params.id);
    if (!user || !report) {
      return Response.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const {
      built_proof_asset,
      manager_conversation_done,
      traction_status,
      usefulness_rating,
      notes,
    } = await request.json();

    const payload = {
      report_id: params.id,
      user_id: user.id,
      built_proof_asset: Boolean(built_proof_asset),
      manager_conversation_done: Boolean(manager_conversation_done),
      traction_status: traction_status || 'no_signal',
      usefulness_rating: Number.isFinite(Number(usefulness_rating)) ? Number(usefulness_rating) : null,
      notes: notes || '',
      updated_at: new Date().toISOString(),
    };

    const { data: outcome, error: outcomeError } = await admin
      .from('report_outcomes')
      .upsert(payload, { onConflict: 'report_id' })
      .select(`
        built_proof_asset,
        manager_conversation_done,
        traction_status,
        usefulness_rating,
        notes,
        updated_at
      `)
      .single();

    if (outcomeError || !outcome) {
      return Response.json({ success: false, error: outcomeError?.message || 'Failed to update outcome.' }, { status: 500 });
    }

    await admin
      .from('reports')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('user_id', user.id);

    return Response.json({ success: true, outcome });
  } catch (error) {
    console.error('Outcome update error:', error);
    return Response.json({ success: false, error: 'Failed to update report outcome.' }, { status: 500 });
  }
}
