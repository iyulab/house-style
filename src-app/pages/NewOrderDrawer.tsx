import { useEffect, useState } from 'react';
import { FormSection, FormRow } from '@iyulab/enterprise';
import { UButton, UInput, UDrawer } from '../lib/ui-react.js';
import type { UInput as UInputElement } from '@iyulab/components';
import { svc } from '../lib/odata.js';
import type { Order } from '../mocks/data.js';

export default function NewOrderDrawer({ open, onClose, onCreated }: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [customer, setCustomer] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setCustomer('');
      setError('');
    }
  }, [open]);

  async function save() {
    if (!customer.trim()) {
      setError('Enter a customer name.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await svc.odataPost<Order>('Orders', { Customer: customer.trim(), Total: 0 });
      setCustomer('');
      onCreated();
      onClose();
    } catch (e) {
      // Same two-tier split as OrderDetailPage.saveEdit / NewOrderPage.submit — a typed API
      // error carries a server-written message worth showing as-is; anything else (a raw
      // network failure) gets one generic, honest sentence instead of a technical one.
      if (e instanceof svc.ApiError) {
        setError(e.message);
      } else {
        setError('Could not reach the server. Check your connection and try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <UDrawer open={open} placement="right" closable onHide={onClose}>
      <span slot="header">New order</span>
      <FormSection title="Details">
        <FormRow full>
          <UInput
            label="Customer"
            value={customer}
            disabled={saving}
            onChange={(e) => setCustomer((e.target as UInputElement).value ?? '')}
          />
        </FormRow>
      </FormSection>
      {error && <p role="alert">{error}</p>}
      <div slot="footer" style={{ display: 'flex', gap: 'var(--u-space-md, 16px)' }}>
        <UButton onClick={onClose} disabled={saving}>Cancel</UButton>
        <UButton color="primary" onClick={save} loading={saving} disabled={saving}>
          Create
        </UButton>
      </div>
    </UDrawer>
  );
}
