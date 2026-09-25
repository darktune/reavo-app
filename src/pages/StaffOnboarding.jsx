import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffOnboarding() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchInvite() {
      if (!token) {
        setError('No invitation token provided.');
        setLoading(false);
        return;
      }

      const cleanToken = token.trim();

      try {
        // 1. Primary: Serverless API with service_role (bypasses RLS across all devices)
        try {
          const apiRes = await fetch(`/api/admin/invite-staff?token=${encodeURIComponent(cleanToken)}`);
          const apiData = await apiRes.json();
          if (apiRes.ok && apiData.success && apiData.invite) {
            setInvite(apiData.invite);
            setLoading(false);
            return;
          } else if (apiRes.status === 410 || apiRes.status === 404) {
            throw new Error(apiData.error || 'Invalid or expired invitation link.');
          }
        } catch (apiErr) {
          if (apiErr.message?.includes('already been accepted') || apiErr.message?.includes('Invalid invitation')) {
            throw apiErr;
          }
          console.warn('[StaffOnboarding] API check unavailable, attempting client fallback:', apiErr.message);
        }

        // 2. Secondary: Secure RPC fallback
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_staff_invite', { p_token: cleanToken });
          const inviteRecord = Array.isArray(rpcData) ? rpcData[0] : rpcData;
          if (!rpcError && inviteRecord) {
            if (inviteRecord.status !== 'pending') {
              throw new Error('This invitation has already been accepted or expired.');
            }
            setInvite(inviteRecord);
            setLoading(false);
            return;
          }
        } catch (rpcErr) {
          if (rpcErr.message?.includes('already been accepted')) throw rpcErr;
        }

        // 3. Tertiary: Direct table query fallback
        const { data, error: tableErr } = await supabase
          .from('staff_invites')
          .select('*')
          .eq('id', cleanToken)
          .maybeSingle();

        if (!tableErr && data) {
          if (data.status !== 'pending') {
            throw new Error('This invitation has already been accepted or expired.');
          }
          setInvite(data);
          setLoading(false);
          return;
        }

        // 4. Quaternary: Resilient fallback from localStorage
        const localInvites = JSON.parse(localStorage.getItem('reavo_staff_invites') || '[]');
        const localMatch = localInvites.find(inv => inv.id === cleanToken);
        if (localMatch) {
          if (localMatch.status !== 'pending') {
            throw new Error('This invitation has already been accepted or expired.');
          }
          setInvite(localMatch);
          setLoading(false);
          return;
        }

        throw new Error('Invalid or expired invitation link. Please request a new invite from your workspace admin.');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInvite();
  }, [token]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setSubmitting(true);
    const cleanToken = token.trim();

    try {
      let acceptedViaApi = false;

      // 1. Primary: Serverless handler with service_role privilege
      try {
        const res = await fetch('/api/admin/invite-staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'accept',
            token: cleanToken,
            password
          })
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          acceptedViaApi = true;
        } else {
          console.warn('[StaffOnboarding] API accept failed, trying client auth:', resData.error);
        }
      } catch (apiErr) {
        console.warn('[StaffOnboarding] API network error, falling back to client auth:', apiErr.message);
      }

      // 2. Fallback: Client-side auth if API was unavailable
      if (!acceptedViaApi) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: invite.email,
          password: password,
          options: {
            data: {
              full_name: invite.name,
              role: invite.role
            }
          }
        });
        if (authError) throw authError;

        const userId = authData.user?.id;
        if (userId) {
          const { error: rpcErr } = await supabase.rpc('accept_staff_invite', {
            p_token: cleanToken,
            p_user_id: userId,
            p_email: invite.email
          });
          if (rpcErr) {
            await supabase.from('staff').insert({
              id: userId,
              user_id: userId,
              name: invite.name,
              email: invite.email,
              role: invite.role,
              is_active: true
            });
            await supabase.from('staff_invites').update({ status: 'accepted' }).eq('id', cleanToken);
          }
        }
      }

      // 3. Log in to establish client session
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: invite.email,
        password: password
      });

      if (loginErr) {
        console.warn('[StaffOnboarding] Auto login note:', loginErr.message);
      }

      // Mark status accepted in local fallback storage
      try {
        const stored = JSON.parse(localStorage.getItem('reavo_staff_invites') || '[]');
        const updated = stored.map(inv => inv.id === cleanToken ? { ...inv, status: 'accepted' } : inv);
        localStorage.setItem('reavo_staff_invites', JSON.stringify(updated));
      } catch (e) {}

      toast.success('Account verified! Welcome to REAVO OS.');
      
      setTimeout(() => {
        navigate('/admin');
      }, 1200);

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create account');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="spin" size={32} color="var(--accent-primary)" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="glass-panel" style={{ padding: 48, borderRadius: 24, textAlign: 'center', maxWidth: 400 }}>
          <AlertCircle size={48} color="var(--accent-primary)" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Invalid Invite</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass-panel" style={{ padding: 48, borderRadius: 24, width: '100%', maxWidth: 480 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
          <Shield size={32} color="var(--accent-primary)" />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              REAVO OS
            </h1>
            <div style={{ fontSize: 13, color: 'var(--accent-primary)', letterSpacing: 2 }}>STAFF ONBOARDING</div>
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>Welcome, {invite.name}!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
            You have been invited to join the REAVO Staff Portal as an <strong style={{ color: 'var(--accent-primary)' }}>{invite.role}</strong>. Please create a password to secure your account.
          </p>
        </div>

        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
              Email Address
            </label>
            <input 
              type="email" 
              value={invite.email} 
              disabled
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: 15, cursor: 'not-allowed' }} 
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
              Create Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'var(--bg-inner)', border: '1px solid var(--border-active)', color: 'var(--text-primary)', fontSize: 15 }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            style={{ 
              width: '100%', 
              padding: 16, 
              borderRadius: 12, 
              background: 'var(--accent-primary)', 
              color: 'var(--bg-void)', 
              fontWeight: 700, 
              fontSize: 15,
              border: 'none', 
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? <Loader2 className="spin" size={20} /> : <CheckCircle size={20} />}
            {submitting ? 'Creating Account...' : 'Join Workspace'}
          </button>
        </form>

      </div>
    </div>
  );
}
