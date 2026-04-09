function addDays(baseDate, days) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date;
}

export async function queueReminderEvent(supabase, {
  reportId,
  userEmail,
  type,
  currentWeek = null,
  jobTitle,
  industry,
  scheduledFor,
}) {
  if (!supabase || !reportId || !userEmail || !type || !scheduledFor) return null;

  let query = supabase
    .from('reminder_events')
    .select('id, status')
    .eq('report_id', reportId)
    .eq('type', type)
    .limit(1);

  if (currentWeek === null || currentWeek === undefined) {
    query = query.is('current_week', null);
  } else {
    query = query.eq('current_week', currentWeek);
  }

  const { data: existing } = await query.maybeSingle();
  if (existing?.id && existing.status !== 'failed') {
    return existing;
  }

  const payload = {
    report_id: reportId,
    user_email: userEmail,
    type,
    current_week: currentWeek,
    job_title: jobTitle || 'Career Pivot Plan',
    industry: industry || 'General',
    scheduled_for: scheduledFor,
  };

  if (existing?.id) {
    const { data } = await supabase
      .from('reminder_events')
      .update({
        ...payload,
        status: 'pending',
        error_message: null,
        sent_at: null,
      })
      .eq('id', existing.id)
      .select('id, status')
      .maybeSingle();
    return data || null;
  }

  const { data } = await supabase
    .from('reminder_events')
    .insert(payload)
    .select('id, status')
    .maybeSingle();

  return data || null;
}

export async function scheduleOutcomeFollowups(supabase, {
  reportId,
  userEmail,
  jobTitle,
  industry,
  baseDate = new Date().toISOString(),
}) {
  const first = addDays(baseDate, 7);
  first.setHours(9, 0, 0, 0);

  const second = addDays(baseDate, 21);
  second.setHours(9, 0, 0, 0);

  await queueReminderEvent(supabase, {
    reportId,
    userEmail,
    type: 'outcome_7d',
    currentWeek: 7,
    jobTitle,
    industry,
    scheduledFor: first.toISOString(),
  });

  await queueReminderEvent(supabase, {
    reportId,
    userEmail,
    type: 'outcome_21d',
    currentWeek: 21,
    jobTitle,
    industry,
    scheduledFor: second.toISOString(),
  });
}
