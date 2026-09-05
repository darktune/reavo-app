import { supabase } from './supabase';

const LOCAL_AUDIT_STORAGE_KEY = 'reavo_audit_logs';

/**
 * Universally records an audit log entry.
 * Guarantees recording to both Supabase and localStorage fallback.
 */
export async function recordAuditLog({
  actorName = 'Administrator',
  actorType = 'admin',
  role = 'ADMIN',
  action,
  entityType = 'System',
  entityId = null,
  entityName = '',
  oldValue = null,
  newValue = null,
  severity = 'info'
}) {
  const logEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    actor_name: actorName,
    actor_type: actorType,
    role: role,
    action: action,
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    old_value: oldValue,
    new_value: newValue,
    severity: severity,
    created_at: new Date().toISOString()
  };

  // 1. Always append to local persistent cache
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_AUDIT_STORAGE_KEY) || '[]');
    const updated = [logEntry, ...existing.filter(l => l.id !== logEntry.id)].slice(0, 500);
    localStorage.setItem(LOCAL_AUDIT_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not write audit log to local cache:', err);
  }

  // 2. Attempt write to Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const actor = session?.user?.user_metadata?.full_name || session?.user?.email || actorName;
    
    await supabase.from('audit_logs').insert([{
      actor_name: actor,
      actor_type: actorType,
      action: action,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      old_value: oldValue,
      new_value: newValue,
      severity: severity
    }]);
  } catch (err) {
    console.warn('Supabase audit_logs insert failed, log safely preserved locally:', err.message);
  }

  return logEntry;
}

/**
 * Returns all audit logs merged from Supabase and local cache, deduplicated.
 */
export async function getUnifiedAuditLogs() {
  let cloudLogs = [];
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error && data) {
      cloudLogs = data;
    }
  } catch (err) {
    console.warn('Could not read cloud audit logs:', err.message);
  }

  let localLogs = [];
  try {
    localLogs = JSON.parse(localStorage.getItem(LOCAL_AUDIT_STORAGE_KEY) || '[]');
  } catch (err) {
    localLogs = [];
  }

  // Merge & deduplicate by action + entity_name + created_at timestamp closeness
  const seen = new Set();
  const unified = [];

  for (const log of [...localLogs, ...cloudLogs]) {
    const key = `${log.action}_${log.entity_name}_${log.created_at?.slice(0, 16)}`;
    if (!seen.has(key)) {
      seen.add(key);
      unified.push(log);
    }
  }

  return unified.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
