import { useEffect, useState } from 'react';
import { Wizard } from '@iyulab/modern-app/react';
import type { WizardStep, WizardStepChangeDetail } from '@iyulab/modern-app/react';
import { FormSection, FormRow } from '@iyulab/enterprise';
import { UInput, UButton } from '../lib/ui-react.js';
import type { UInput as UInputElement } from '@iyulab/components';
import ItemEntryForm, { type ItemEntryFormLine } from '../components/ItemEntryForm.js';
import { svc } from '../lib/odata.js';
import type { Order, OrderItem, Product } from '../mocks/data.js';

const STEPS: WizardStep[] = [
  { id: 'customer', label: 'Customer' },
  { id: 'items', label: 'Items' },
  { id: 'review', label: 'Review' },
];

export default function NewOrderPage() {
  const [active, setActive] = useState(0);
  const [customer, setCustomer] = useState('');
  const [lines, setLines] = useState<ItemEntryFormLine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [steps, setSteps] = useState(STEPS);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Order | null>(null);
  const [partialFailure, setPartialFailure] = useState<{ saved: number; total: number } | null>(null);

  useEffect(() => { svc.odataGet<Product>('Products').then(setProducts); }, []);

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
    if (from === 1 && to === 2 && lines.length === 0) {
      e.preventDefault();
      markStep('items', 'error');
      return;
    }
    if (from === 0) markStep('customer', 'done');
    if (from === 1) markStep('items', 'done');
    setActive(to);
  }

  function addLine(line: ItemEntryFormLine) {
    setLines((prev) => [...prev, line]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const total = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  async function submit() {
    setError('');
    setSubmitting(true);
    try {
      const created = await svc.odataPost<Order>('Orders', { Customer: customer.trim(), Total: total });
      let saved = 0;
      for (const line of lines) {
        try {
          // Quiet, one item POST at a time — a batch/transactional create-with-items endpoint
          // doesn't exist on this mock backend (or on a typical OData server without a custom
          // action), so a failure partway through is a real, honest possibility this app
          // surfaces below rather than hides.
          await svc.odataPostQuiet<OrderItem>('OrderItems', {
            OrderId: created.Id,
            ProductId: line.productId,
            ProductName: line.productName,
            Quantity: line.quantity,
            UnitPrice: line.unitPrice,
          });
          saved++;
        } catch {
          break;
        }
      }
      if (saved < lines.length) {
        const actualTotal = lines.slice(0, saved).reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
        // Best-effort correction — if this also fails, the completion screen's message below still
        // tells the user where to fix things manually.
        await svc.odataPatch<Order>('Orders', created.Id, { Total: actualTotal }).catch(() => {});
      }
      setDone(created);
      setPartialFailure(saved < lines.length ? { saved, total: lines.length } : null);
    } catch (e) {
      // Same two-tier split as OrderDetailPage.saveEdit: a typed API error carries a
      // server-written message worth showing as-is; anything else (a raw network failure)
      // gets one generic, honest sentence instead of a technical one.
      if (e instanceof svc.ApiError) {
        setError(e.message);
      } else {
        setError('Could not reach the server. Check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div>
        <h2>Order created</h2>
        <p>{done.Id} — {done.Customer}</p>
        {partialFailure && (
          <p role="alert">
            {partialFailure.saved} of {partialFailure.total} items were saved. Add the rest from the order's detail page.
          </p>
        )}
        <UButton onClick={() => {
          setDone(null);
          setPartialFailure(null);
          setActive(0);
          setCustomer('');
          setLines([]);
          setSteps(STEPS);
        }}>
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
        <FormSection title="Items">
          {lines.map((line, i) => (
            <div
              key={`${line.productId}-${i}`}
              style={{ display: 'flex', gap: 'var(--u-space-md, 16px)', alignItems: 'center', padding: 'var(--u-space-sm, 10px) 0' }}
            >
              <span style={{ flex: 1 }}>{line.productName} × {line.quantity}</span>
              <span>₩{(line.quantity * line.unitPrice).toLocaleString()}</span>
              <UButton color="danger" onClick={() => removeLine(i)}>Remove</UButton>
            </div>
          ))}
          <ItemEntryForm products={products} onAdd={addLine} />
        </FormSection>
      </div>
      <div>
        <FormSection title="Review">
          <p>{customer || '(no customer)'}</p>
          {lines.map((line, i) => (
            <p key={`${line.productId}-${i}`}>{line.productName} × {line.quantity} — ₩{(line.quantity * line.unitPrice).toLocaleString()}</p>
          ))}
          <p>Total: ₩{total.toLocaleString()}</p>
          {error && <p role="alert">{error}</p>}
        </FormSection>
      </div>
      {active === 2 && (
        // Direct child of `<Wizard>` — slot assignment only applies to a host's direct
        // children, not grandchildren. Gated on `active === 2` so it only replaces the
        // default actions on the review step; steps 0/1 keep the wizard's own Back/Next
        // (which is what drives `step-change` and the validation gates above).
        <span slot="actions">
          <UButton onClick={() => setActive(1)} disabled={submitting}>Back</UButton>
          <UButton color="primary" onClick={submit} loading={submitting} disabled={submitting}>
            Create order
          </UButton>
        </span>
      )}
    </Wizard>
  );
}
