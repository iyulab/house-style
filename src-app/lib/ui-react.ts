import * as React from 'react';
import { createComponent } from '@lit/react';
import { UButton as UButtonElement, UBadge as UBadgeElement } from '@iyulab/components';

// `@iyulab/components/react` cannot be imported anywhere in this program — see the
// comment block in `LoginPage.tsx` for the full technical explanation (duplicate
// `HTMLElementTagNameMap` merge across `/react`'s built typings and this workspace's
// own source-resolved custom element classes). This module builds the wrappers this
// reference app needs directly from the same source classes everything else in the
// program already resolves to, so every page shares a single declaration per
// component instead of redeclaring them per file.
export const UButton = createComponent({
  react: React,
  tagName: 'u-button',
  elementClass: UButtonElement,
  events: {},
});

export const UBadge = createComponent({
  react: React,
  tagName: 'u-badge',
  elementClass: UBadgeElement,
  events: {},
});
