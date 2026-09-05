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

      try {
        // First try the secure RPC to prevent broad table data leakage
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_staff_invite', { p_token: token });
        const inviteRecord = Array.isArray(rpcData) ? rpcData[0] : rpcData;

        if (!rpcError && inviteRecord) {
          if (inviteRecord.status !== 'pending') {
            throw new Error('This invitation has already been accepted or expired.');
          }
          setInvite(inviteRecord);
          return;
        }

        // Direct table query fallback for development
        const { data, error } = await supabase
          .from('staff_invites')
          .select('*')
          .eq('id', token)
          .single();

        if (!error && data) {
          if (data.status !== 'pending') {
            throw new Error('This invitation has already been accepted or expired.');
          }
          setInvite(data);
          return;
        }

        // Resilient fallback: check client-side stored invites
        const localInvites = JSON.parse(localStorage.getItem('reavo_staff_invites') || '[]');
        const localMatch = localInvites.find(inv => inv.id === token);
        if (localMatch) {
          if (localMatch.status !== 'pending') {
            throw new Error('This invitation has already been accepted or expired.');
          }
          setInvite(localMatch);
          return;
        }

        throw new Error('Invalid or expired invitation link.');
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
    
    try {
      // 1. Create the user in Supabase Auth
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
      if (!userId) throw new Error('Failed to obtain user identity from authentication provider.');

      // 2. Execute secure atomic RPC to prevent client-side privilege escalation
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('accept_staff_invite', {
        p_token: token,
        p_user_id: userId,
        p_email: invite.email
      });

      if (rpcErr) {
        console.warn('RPC unavailable, using fallback insert:', rpcErr);
        // Fallback for development environments before SQL schema sync
        const { error: staffError } = await supabase.from('staff').insert({
          id: userId,
          user_id: userId,
          name: invite.name,
          email: invite.email,
          role: invite.role,
          is_active: true
        });
        if (staffError && staffError.code !== '23505') throw staffError;

        await supabase.from('staff_invites').update({ status: 'accepted' }).eq('id', token);
      }

      // Mark status accepted in local fallback storage
      try {
        const stored = JSON.parse(localStorage.getItem('reavo_staff_invites') || '[]');
        const updated = stored.map(inv => inv.id === token ? { ...inv, status: 'accepted' } : inv);
        localStorage.setItem('reavo_staff_invites', JSON.stringify(updated));
      } catch (e) {}

      toast.success('Account verified! Welcome to REAVO OS.');
      
      // Give session time to persist then redirect
      setTimeout(() => {
        navigate('/admin');
      }, 1500);

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
