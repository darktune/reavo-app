import { createClient } from '@supabase/supabase-js';

/**
 * Customer Registration Serverless Handler
 * Runs server-side with SUPABASE_SERVICE_ROLE_KEY to:
 * 1. Accurately verify email uniqueness (preventing silent duplicate swallowing).
 * 2. Create the customer account with pre-confirmed email (email_confirm: true),
 *    preventing users from being blocked by rate-limited or spam-filtered confirmation emails.
 * 3. Automatically link Owner privileges if registering with the primary executive email.
 * 4. Register customer record in the `customers` database table.
 * 
 * POST /api/auth/register
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const { name, email, password } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: 'Full name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    return res.status(500).json({ success: false, error: 'Server configuration error: missing SUPABASE_SERVICE_ROLE_KEY.' });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // 1. Check if user already exists
    const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('[Register API] Error listing users:', listError);
    } else {
      const existingUser = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email address already exists. Please sign in or use "Forgot password?".',
          emailExists: true
        });
      }
    }

    // 2. Identify role
    const isOwner = cleanEmail === 'abrahamtoluwani999@gmail.com' || cleanEmail === 'admin@reavoglobal.com';
    const role = isOwner ? 'OWNER' : 'customer';

    // 3. Create pre-confirmed user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        role: role
      },
      app_metadata: {
        role: role
      }
    });

    if (createError) {
      console.error('[Register API] Create user error:', createError);
      return res.status(400).json({ success: false, error: createError.message });
    }

    // 4. Upsert into customers table for CRM and order history tracking
    try {
      await supabase.from('customers').upsert({
        id: `cust_${newUser.user.id.substring(0, 8)}`,
        name: cleanName,
        email: cleanEmail,
        status: 'Active',
        ltv_tier: isOwner ? 'VIP' : 'New',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (crmErr) {
      console.warn('[Register API] Optional customer sync warning:', crmErr.message);
    }

    return res.status(200).json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        name: cleanName,
        role: role
      }
    });
  } catch (err) {
    console.error('[Register API] Unexpected Exception:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
