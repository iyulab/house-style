import { useState } from 'react';
import { Wizard } from '@iyulab/modern-app/react';
import type { WizardStep, WizardStepChangeDetail } from '@iyulab/modern-app/react';
import { FormSection, FormRow } from '@iyulab/enterprise';
import { UInput, UButton } from '../lib/ui-react.js';
import type { UInput as UInputElement } from '@iyulab/components';
import { svc } from '../lib/odata.js';
import type { Order } from '../mocks/data.js';

const STEPS: WizardStep[] = [
  { id: 'customer', label: 'Customer' },
  { id: 'amount', label: 'Amount' },
  { id: 'review', label: 'Review' },
];

export default function NewOrderPage() {
  const [active, setActive] = useState(0);
  const [customer, setCustomer] = useState('');
  const [total, setTotal] = useState('');
  const [steps, setSteps] = useState(STEPS);
  const [error, setError] = useState('');
  const [done, setDone] = useState<Order | null>(null);

  function markStep(id: string, state: WizardStep['state']) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, state } : s)));
  }

  function handleStepChange(e: CustomEvent<WizardStepChangeDetail>) {
    const { from, to } = e.detail;
    if (from === 0 && to === 1 && !customer.trim()) {
      e.preventDefault();
      markStep('customer', 'error');
      return;
    }
    if (from === 0) markStep('customer', 'done');
    setActive(to);
  }

  async function submit() {
    setError('');
    try {
      const created = await svc.odataPost<Order>('Orders', { Customer: customer.trim(), Total: Number(total) || 0 });
      setDone(created);
    } catch (e) {
      if (e instanceof svc.ApiError) {
        // Typed API error — the server's own message, unmodified (e.g. a duplicate-order
        // conflict). This is exactly the context a raw TypeError below would not have.
        setError(e.message);
      } else {
        // Raw network failure (offline, DNS, CORS) — no server context exists to show, so a
        // generic message is the honest answer, not a technical one.
        setError('Could not reach the server. Check your connection and try again.');
      }
    }
  }

  if (done) {
    return (
      <div>
        <h2>Order created</h2>
        <p>{done.Id} — {done.Customer}</p>
        <UButton onClick={() => { setDone(null); setActive(0); setCustomer(''); setTotal(''); setSteps(STEPS); }}>
          Create another
        </UButton>
      </div>
    );
  }

  return (
    <Wizard steps={steps} active={active} onStepChange={handleStepChange}>
      <div>
        <FormSection title="Customer">
          <FormRow full>
            <UInput label="Customer name" value={customer} onChange={(e) => setCustomer((e.target as UInputElement).value ?? '')} />
          </FormRow>
        </FormSection>
      </div>
      <div>
        <FormSection title="Amount">
          <FormRow full>
            <UInput label="Total (KRW)" type="number" value={total} onChange={(e) => setTotal((e.target as UInputElement).value ?? '')} />
          </FormRow>
        </FormSection>
      </div>
      <div>
        <FormSection title="Review">
          <p>{customer || '(no customer)'} — ₩{Number(total || 0).toLocaleString()}</p>
          {error && <p role="alert">{error}</p>}
        </FormSection>
      </div>
      {active === 2 && (
        // Direct child of `<Wizard>` — slot assignment only applies to a host's direct
        // children, not grandchildren. Nesting this inside the review step's own `<div>`
        // above (a grandchild of `<Wizard>`) would silently drop it from the "actions" slot
        // and leave the wizard's own default Back/Next fallback rendered instead — the
        // duplicate-Back-button bug the house-style guide's Flows section hit once. Gated
        // on `active === 2` so it only replaces the default actions on the review step;
        // steps 0/1 keep the wizard's own Back/Next (which is what drives `step-change` and
        // the validation gate above).
        <span slot="actions">
          <UButton onClick={() => setActive(1)}>Back</UButton>
          <UButton color="primary" onClick={submit}>Create order</UButton>
        </span>
      )}
    </Wizard>
  );
}
