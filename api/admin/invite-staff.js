import { createClient } from '@supabase/supabase-js';

/**
 * Staff Invitation Serverless Handler
 * Runs server-side with SUPABASE_SERVICE_ROLE_KEY to bypass client RLS restrictions
 * and safely generate authentic, cross-device shareable staff invite tokens.
 * 
 * POST /api/admin/invite-staff
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const { email, name, role, permissions } = req.body || {};
  if (!email || !name) {
    return res.status(400).json({ success: false, error: 'Staff name and email are required.' });
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    return res.status(500).json({ success: false, error: 'Server configuration error: missing SUPABASE_SERVICE_ROLE_KEY.' });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const { data, error } = await supabase.from('staff_invites').insert([{
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: role || 'SUPPORT',
      permissions: permissions || [],
      status: 'pending',
      created_at: new Date().toISOString()
    }]).select('id').single();

    if (error) {
      console.error('[InviteStaff] DB Insert Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      inviteId: data.id
    });
  } catch (err) {
    console.error('[InviteStaff] Unexpected Exception:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
