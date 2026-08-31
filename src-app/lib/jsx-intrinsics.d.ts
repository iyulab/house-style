// Raw custom elements this app renders directly in JSX that `@iyulab/components` doesn't yet
// ship a `JSX.IntrinsicElements` declaration for (unlike `@iyulab/u-widgets`, which ships one
// for `<u-widget>`, and `@iyulab/modern-app`, which now ships one for its own raw elements —
// see `ISSUE-modern-app-20260812-missing-jsx-intrinsic-elements-for-raw-custom-elements.md`,
// resolved 2026-08-31; `u-master-detail-layout`'s entry used to live here and was removed once
// modern-app started shipping its own). Remove entries here once the owning library ships its
// own declaration.
import type { Attributes, ReactNode } from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // `u-select`'s own light-DOM child, registered as a side effect of importing `USelect`
      // from `../lib/ui-react.js` — not something a consuming file imports directly.
      'u-option': Attributes & {
        value?: string;
        children?: ReactNode;
      };
    }
  }
}
