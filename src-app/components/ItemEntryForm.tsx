import { useState, type CSSProperties } from 'react';
import { UButton, UInput, USelect } from '../lib/ui-react.js';
import type { UInput as UInputElement, USelect as USelectElement } from '@iyulab/components';
import type { Product } from '../mocks/data.js';
import { useUnsavedChanges } from '@iyulab/modern-app/react';

export interface ItemEntryFormLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

// Shared by NewOrderPage's Items step and OrderDetailPage's inline Items section — same
// "pick a product, adjust quantity/price, add" shape in both places.
export default function ItemEntryForm({ products, onAdd, disabled }: {
  products: Product[];
  onAdd: (line: ItemEntryFormLine) => void;
  disabled?: boolean;
}) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  // A line that was started but not added is unsaved input — leaving the screen asks first.
  useUnsavedChanges(productId !== '' || quantity !== '1' || unitPrice !== '');

  function selectProduct(id: string) {
    setProductId(id);
    const product = products.find((p) => p.Id === id);
    setUnitPrice(product ? String(product.UnitPrice) : '');
  }

  function add() {
    const product = products.find((p) => p.Id === productId);
    if (!product || Number(quantity) <= 0) return;
    onAdd({
      productId: product.Id,
      productName: product.Name,
      quantity: Number(quantity),
      unitPrice: unitPrice === '' ? product.UnitPrice : Number(unitPrice),
    });
    setProductId('');
    setQuantity('1');
    setUnitPrice('');
  }

  return (
    // A wrapping row with declared bases: an empty `u-select` has no intrinsic width (nothing is
    // selected yet, so it measured the chevron alone — 45px), so each control states its own basis and
    // fills it (`--u-*-display: block`). Wide, the four sit on one form line; in a narrow detail pane
    // (a phone) the product takes its own line and quantity, price and the button share the next —
    // a fixed four-track grid needed ~560px and scrolled the pane sideways.
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--u-space-md, 16px)',
        alignItems: 'end',
        ['--u-select-display' as string]: 'block',
        ['--u-input-display' as string]: 'block',
      } as CSSProperties}
    >
      <USelect
        style={{ flex: '2 1 14rem', minWidth: 0 }}
        label="Product"
        value={productId}
        disabled={disabled}
        onChange={(e) => selectProduct((e.target as USelectElement).value as string)}
      >
        {products.map((p) => (
          <u-option key={p.Id} value={p.Id}>{p.Name}</u-option>
        ))}
      </USelect>
      <UInput
        style={{ flex: '1 1 5.5rem', minWidth: 0 }}
        label="Quantity"
        type="number"
        value={quantity}
        disabled={disabled}
        onInput={(e) => setQuantity((e.target as UInputElement).value ?? '1')}
      />
      <UInput
        style={{ flex: '1 1 6.5rem', minWidth: 0 }}
        label="Unit price"
        type="number"
        value={unitPrice}
        disabled={disabled}
        onInput={(e) => setUnitPrice((e.target as UInputElement).value ?? '')}
      />
      <UButton appearance="outlined" onClick={add} disabled={disabled || !productId}>Add item</UButton>
    </div>
  );
}
