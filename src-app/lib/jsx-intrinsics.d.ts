// Raw custom elements this app renders directly in JSX that `@iyulab/modern-app` /
// `@iyulab/components` don't yet ship a `JSX.IntrinsicElements` declaration for (unlike
// `@iyulab/u-widgets`, which ships one for `<u-widget>`) — without these, TypeScript rejects
// the elements below in JSX even though neither needs a `/react` wrapper. Centralized here
// (rather than repeated per-file `declare module` blocks) because two files render `<u-option>`.
// Remove entries here once the owning library ships its own declaration.
import type { Attributes, ReactNode } from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'u-master-detail-layout': {
        'master-size'?: string;
        'overlay-breakpoint'?: number;
        children?: ReactNode;
      };
      // `u-select`'s own light-DOM child, registered as a side effect of importing `USelect`
      // from `../lib/ui-react.js` — not something a consuming file imports directly.
      'u-option': Attributes & {
        value?: string;
        children?: ReactNode;
      };
    }
  }
}
