import { useState, type CSSProperties } from 'react';
import { UButton, UInput, USelect } from '../lib/ui-react.js';
import type { UInput as UInputElement, USelect as USelectElement } from '@iyulab/components';
import type { Product } from '../mocks/data.js';

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
    // A grid with declared tracks, not a wrapping flex row: an empty `u-select` has no intrinsic
    // width (nothing is selected yet, so it measured the chevron alone — 45px), and flex sized it to
    // that. Each control fills its track (`--u-*-display: block`), so the row reads as one form line.
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(12rem, 2fr) minmax(7rem, 1fr) minmax(8rem, 1fr) auto',
        gap: 'var(--u-space-md, 16px)',
        alignItems: 'end',
        ['--u-select-display' as string]: 'block',
        ['--u-input-display' as string]: 'block',
      } as CSSProperties}
    >
      <USelect
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
        label="Quantity"
        type="number"
        value={quantity}
        disabled={disabled}
        onChange={(e) => setQuantity((e.target as UInputElement).value ?? '1')}
      />
      <UInput
        label="Unit price"
        type="number"
        value={unitPrice}
        disabled={disabled}
        onChange={(e) => setUnitPrice((e.target as UInputElement).value ?? '')}
      />
      <UButton variant="outlined" onClick={add} disabled={disabled || !productId}>Add item</UButton>
    </div>
  );
}
