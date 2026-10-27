// Tokens that must reach a component drawn inside another component's shadow root (node --test, no dependencies).
//
// A rule in this sheet keyed on a component's tag (`u-steps { … }`) matches only elements in the document. A table
// draws its cells in its own shadow root, so a component rendered in a cell never sees that rule — its token falls back
// to the component's default. A custom property inherits across a shadow boundary, so a token the component reads but
// does not declare on its own host is set on `:root` instead, where every shadow tree inherits it.
// (A token the component *does* declare on its host cannot be set this way — the host's declaration wins over an
// inherited value; those keep the tag rule, and a cell picks them up by adopting this sheet: `table.stylesheets`.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { blocks } from './lib/css-color.mjs';

const all = blocks(readFileSync(fileURLToPath(new URL('../styles/components.css', import.meta.url)), 'utf8'));

/** Token → the component that reads it without declaring it on its host. */
const INHERITED = {
  '--steps-current-color': 'u-steps',
  '--info-field-xl-size': 'u-info-field',
};

for (const [token, tag] of Object.entries(INHERITED)) {
  test(`${token} is set on :root, where a ${tag} inside a shadow root inherits it`, () => {
    assert.ok(all.some(b => b.selector === ':root' && b.decls.has(token)), `${token} is not set on :root`);
    const keyed = all.filter(b => b.selector.split(',').some(s => s.trim().startsWith(tag)) && b.decls.has(token));
    assert.deepEqual(keyed.map(b => b.selector), [], `${token} is set on a ${tag} rule, which a shadow root does not reach`);
  });
}
