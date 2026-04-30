import { supabase } from './supabase';

export async function logAction(
  action: string,
  entityType: string,
  entityId: string,
  performedBy: string,
  details: Record<string, unknown> = {}
) {
  const { error } = await supabase.from('audit_logs').insert({
    action,
    entity_type: entityType,
    entity_id: entityId,
    performed_by: performedBy,
    details,
    ip_address: '10.0.***.**',
  });

  if (error) {
    console.error('Audit log error:', error.message);
  }
}

export async function saveSecurityAction(
  actionType: string,
  accountId: string,
  reason: string,
  performedBy: string,
  transactionId?: string
) {
  const { data, error } = await supabase.from('security_actions').insert({
    action_type: actionType,
    account_id: accountId,
    transaction_id: transactionId || '',
    reason,
    performed_by: performedBy,
    status: 'pending',
  }).select().maybeSingle();

  if (error) {
    console.error('Security action error:', error.message);
    return null;
  }

  await logAction(
    `Security action triggered: ${actionType}`,
    'account',
    accountId,
    performedBy,
    { actionType, reason, transactionId }
  );

  return data;
}
