import { createClient } from '@supabase/supabase-js';

/**
 * Universal Staff Invitation & Onboarding Serverless Handler
 * Runs server-side with SUPABASE_SERVICE_ROLE_KEY to:
 * 1. GET  /api/admin/invite-staff?token=<id> -> Validate & retrieve pending invitation metadata (cross-device, no RLS block)
 * 2. POST /api/admin/invite-staff (action='accept') -> Complete staff onboarding, create auth user, activate staff profile
 * 3. POST /api/admin/invite-staff (action='create') -> Generate a new secure staff invite record
 */

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error: missing Supabase credentials in environment.'
    });
  }

  // -------------------------------------------------------------
  // 1. GET: Verify / Retrieve Staff Invitation Token
  // -------------------------------------------------------------
  if (req.method === 'GET') {
    const rawToken = req.query?.token;
    if (!rawToken || typeof rawToken !== 'string') {
      return res.status(400).json({ success: false, error: 'No invitation token provided.' });
    }

    const token = rawToken.trim();

    try {
      const { data, error } = await supabase
        .from('staff_invites')
        .select('id, name, email, role, permissions, status, created_at')
        .eq('id', token)
        .maybeSingle();

      if (error) {
        console.error('[InviteStaff GET] DB query error:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Invalid invitation link. No invitation found for this token.'
        });
      }

      if (data.status !== 'pending') {
        return res.status(410).json({
          success: false,
          error: 'This invitation has already been accepted or expired.'
        });
      }

      return res.status(200).json({
        success: true,
        valid: true,
        invite: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          permissions: data.permissions || [],
          status: data.status
        }
      });
    } catch (err) {
      console.error('[InviteStaff GET] Exception:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // -------------------------------------------------------------
  // 2. POST: Create Invite OR Accept Invite
  // -------------------------------------------------------------
  if (req.method === 'POST') {
    const { action, token, password, email, name, role, permissions } = req.body || {};

    // ──────────────────────────────────────────────
    // A. ACCEPT INVITATION & ACTIVATE STAFF
    // ──────────────────────────────────────────────
    if (action === 'accept') {
      if (!token || !password) {
        return res.status(400).json({ success: false, error: 'Token and password are required.' });
      }

      const cleanToken = String(token).trim();

      try {
        // 1. Fetch pending invite record
        const { data: inviteRecord, error: fetchErr } = await supabase
          .from('staff_invites')
          .select('*')
          .eq('id', cleanToken)
          .maybeSingle();

        if (fetchErr || !inviteRecord) {
          return res.status(404).json({
            success: false,
            error: 'Invalid invitation link. No invitation found for this token.'
          });
        }

        if (inviteRecord.status !== 'pending') {
          return res.status(410).json({
            success: false,
            error: 'This invitation has already been accepted or expired.'
          });
        }

        const staffEmail = inviteRecord.email.toLowerCase().trim();

        // 2. Create or update Supabase Auth user
        let userId = null;

        const { data: authCreated, error: createError } = await supabase.auth.admin.createUser({
          email: staffEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: inviteRecord.name,
            role: inviteRecord.role
          }
        });

        if (authCreated?.user?.id) {
          userId = authCreated.user.id;
        } else if (createError) {
          console.warn('[InviteStaff Accept] Create user note:', createError.message);
          // Check if user already exists
          const { data: userList } = await supabase.auth.admin.listUsers();
          const existing = userList?.users?.find(
            u => u.email?.toLowerCase() === staffEmail
          );
          if (existing) {
            userId = existing.id;
            await supabase.auth.admin.updateUserById(userId, {
              password: password,
              email_confirm: true,
              user_metadata: {
                full_name: inviteRecord.name,
                role: inviteRecord.role
              }
            });
          } else {
            throw new Error(createError.message || 'Failed to initialize staff authentication record.');
          }
        }

        if (!userId) {
          throw new Error('Failed to obtain authenticated staff identity.');
        }

        // 3. Upsert into public.staff with assigned role & permissions
        const { error: staffErr } = await supabase.from('staff').upsert({
          id: userId,
          user_id: userId,
          name: inviteRecord.name,
          email: staffEmail,
          role: inviteRecord.role,
          permissions: inviteRecord.permissions || [],
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });

        if (staffErr) {
          console.error('[InviteStaff Accept] Staff upsert error:', staffErr);
          // Fallback insert if upsert encounters constraint nuances
          await supabase.from('staff').insert([{
            id: userId,
            user_id: userId,
            name: inviteRecord.name,
            email: staffEmail,
            role: inviteRecord.role,
            permissions: inviteRecord.permissions || [],
            is_active: true
          }]);
        }

        // 4. Mark invite as accepted atomically
        await supabase
          .from('staff_invites')
          .update({ status: 'accepted' })
          .eq('id', cleanToken);

        // 5. Record audit log
        try {
          await supabase.from('audit_logs').insert([{
            actor_name: inviteRecord.name,
            actor_type: 'admin',
            action: 'ACCEPT_STAFF_INVITE',
            entity_type: 'staff',
            entity_id: userId,
            entity_name: inviteRecord.name,
            new_value: { role: inviteRecord.role, email: staffEmail },
            severity: 'info'
          }]);
        } catch (auditErr) {
          console.warn('[InviteStaff Accept] Audit log insert non-fatal:', auditErr);
        }

        return res.status(200).json({
          success: true,
          message: 'Staff account successfully created and activated.',
          email: staffEmail,
          role: inviteRecord.role
        });

      } catch (acceptErr) {
        console.error('[InviteStaff Accept] Error:', acceptErr);
        return res.status(500).json({ success: false, error: acceptErr.message });
      }
    }

    // ──────────────────────────────────────────────
    // B. CREATE INVITATION (Default action)
    // ──────────────────────────────────────────────
    if (!email || !name) {
      return res.status(400).json({ success: false, error: 'Staff name and email are required.' });
    }

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
        console.error('[InviteStaff Create] DB Insert Error:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({
        success: true,
        inviteId: data.id
      });
    } catch (err) {
      console.error('[InviteStaff Create] Unexpected Exception:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ success: false, error: 'Method not allowed. Use GET or POST.' });
}
