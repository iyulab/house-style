import { Theme } from '@iyulab/components/dist/utilities/Theme.js';

/**
 * The reference app renders outside `@iyulab/modern-app`'s `app.load()` (which normally owns
 * `Theme.init()`), so it boots the token system itself.
 *
 * The house theme itself is imported once by the app entry (`main.tsx`); its cascade layer makes
 * the import position irrelevant, so nothing here has to be sequenced after `Theme.init()`.
 */
export async function bootTheme(): Promise<void> {
  await Theme.init({
    default: 'light',
    store: {
      type: 'cookie',
      prefix: 'house-style-',
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
    },
  });
}
