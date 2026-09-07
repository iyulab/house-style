// Thin re-export of the React wrappers `@iyulab/components` ships itself.
//
// This module used to hand-build the wrappers with `createComponent` because
// `@iyulab/components/react` could not be imported anywhere in this program: the built
// `/react` typings and this workspace's source-resolved custom element classes merged
// two different `HTMLElementTagNameMap` declarations, so `tsc` reported TS2717. That was
// a defect in the wrapper generator (it referenced the original classes by relative path,
// which bypasses the package's `exports` map), fixed upstream in @iyulab/components@1.37.1
// — the generator now emits package specifiers, so both axes resolve to a single class.
//
// The module is kept as one alias point so every page shares a single declaration per
// component, and so `<u-option>` stays registered as a side effect of importing `USelect`
// (see `jsx-intrinsics.d.ts`). It no longer reimplements anything the library owns.
export { UButton, UBadge, UInput, USelect, UDrawer } from '@iyulab/components/react';
