import * as React from 'react';
import { createComponent } from '@lit/react';
import { UButton as UButtonElement } from '@iyulab/components';

// `@iyulab/components/react` cannot be imported anywhere in this program — see the
// comment block in `LoginPage.tsx` for the full technical explanation (duplicate
// `HTMLElementTagNameMap` merge across `/react`'s built typings and this workspace's
// own source-resolved custom element classes). This module builds the one wrapper
// this reference app needs directly from the same source class everything else in
// the program already resolves to, so every page shares a single `UButton`
// declaration instead of redeclaring it per file.
export const UButton = createComponent({
  react: React,
  tagName: 'u-button',
  elementClass: UButtonElement,
  events: {},
});
